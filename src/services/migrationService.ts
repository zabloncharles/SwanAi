import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ChatService, ChatMessage, Chat } from "./chatService";

export interface MigrationStats {
  usersProcessed: number;
  chatsMigrated: number;
  messagesMigrated: number;
  errors: string[];
}

export class MigrationService {
  /**
   * Migrate all existing chat data from user documents to the new chats collection
   */
  static async migrateAllChatData(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      usersProcessed: 0,
      chatsMigrated: 0,
      messagesMigrated: 0,
      errors: [],
    };

    try {
      console.log("Starting chat data migration...");

      // Get all users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      console.log(`Found ${usersSnapshot.size} users to process`);

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          const userId = userDoc.id;

          console.log(`Processing user: ${userId}`);

          // Check if user has conversation history
          if (userData.conversation_history?.messages?.length > 0) {
            const messages = userData.conversation_history.messages;
            const lifeResumeId = userData.conversation_history.lifeResumeId;

            if (lifeResumeId && messages.length > 0) {
              console.log(
                `Migrating ${messages.length} messages for user ${userId}`
              );

              // Create chat using ChatService
              const chatId = await ChatService.findOrCreateChat(
                userId,
                lifeResumeId,
                "Migrated Companion", // We don't have the original name
                "Friend" // We don't have the original relationship
              );

              // Create messages subcollection
              const chatRef = doc(db, "chats", chatId);
              const messagesRef = collection(chatRef, "messages");
              const batch = writeBatch(db);

              // Add all messages to the batch
              messages.forEach((message: any, index: number) => {
                const messageData: Omit<ChatMessage, "id"> = {
                  userId,
                  chatId,
                  role: message.role,
                  content: message.content,
                  timestamp: message.timestamp
                    ? Timestamp.fromMillis(message.timestamp)
                    : (serverTimestamp() as Timestamp),
                  seen: message.seen || message.role === "user",
                  metadata: message.metadata,
                };

                const messageRef = doc(messagesRef);
                batch.set(messageRef, messageData);
              });

              // Commit the batch
              await batch.commit();

              // Update chat metadata
              await updateDoc(chatRef, {
                messageCount: messages.length,
                lastMessage: messages[messages.length - 1],
                updatedAt: serverTimestamp(),
              });

              // Clear the old conversation history from user document
              await updateDoc(doc(db, "users", userId), {
                "conversation_history.messages": [],
                "conversation_history.lifeResumeId": null,
              });

              stats.chatsMigrated++;
              stats.messagesMigrated += messages.length;

              console.log(
                `✅ Migrated ${messages.length} messages for user ${userId} to chat ${chatId}`
              );
            }
          }

          stats.usersProcessed++;
        } catch (error) {
          const errorMsg = `Error processing user ${userDoc.id}: ${error}`;
          console.error(errorMsg);
          stats.errors.push(errorMsg);
        }
      }

      console.log("Migration completed:", stats);
      return stats;
    } catch (error) {
      const errorMsg = `Migration failed: ${error}`;
      console.error(errorMsg);
      stats.errors.push(errorMsg);
      return stats;
    }
  }

  /**
   * Migrate chat data for a specific user
   */
  static async migrateUserChatData(userId: string): Promise<{
    success: boolean;
    messagesMigrated: number;
    error?: string;
  }> {
    try {
      console.log(`Migrating chat data for user: ${userId}`);

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, messagesMigrated: 0, error: "User not found" };
      }

      const userData = userDoc.data();

      // Check if user has conversation history
      if (!userData.conversation_history?.messages?.length) {
        return {
          success: true,
          messagesMigrated: 0,
          error: "No conversation history found",
        };
      }

      const messages = userData.conversation_history.messages;
      const lifeResumeId = userData.conversation_history.lifeResumeId;

      if (!lifeResumeId) {
        return {
          success: false,
          messagesMigrated: 0,
          error: "No life resume ID found",
        };
      }

      // Create conversation document
      const conversationId = `${userId}_${lifeResumeId}`;
      const conversationRef = doc(db, "conversations", conversationId);

      // Prepare conversation metadata
      const conversationData = {
        id: conversationId,
        userId,
        lifeResumeId,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        title: this.generateConversationTitle(messages[0]?.content || ""),
      };

      // Create conversation document
      await updateDoc(conversationRef, conversationData);

      // Create messages subcollection
      const messagesRef = collection(conversationRef, "messages");
      const batch = writeBatch(db);

      // Add all messages to the batch
      messages.forEach((message: any) => {
        const messageData: Omit<ChatMessage, "id"> = {
          userId,
          lifeResumeId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp
            ? Timestamp.fromMillis(message.timestamp)
            : (serverTimestamp() as Timestamp),
          seen: message.seen || message.role === "user",
          metadata: message.metadata,
        };

        const messageRef = doc(messagesRef);
        batch.set(messageRef, messageData);
      });

      // Commit the batch
      await batch.commit();

      // Clear the old conversation history from user document
      await updateDoc(doc(db, "users", userId), {
        "conversation_history.messages": [],
        "conversation_history.lifeResumeId": null,
      });

      console.log(`✅ Migrated ${messages.length} messages for user ${userId}`);
      return { success: true, messagesMigrated: messages.length };
    } catch (error) {
      const errorMsg = `Error migrating user ${userId}: ${error}`;
      console.error(errorMsg);
      return { success: false, messagesMigrated: 0, error: errorMsg };
    }
  }

  /**
   * Check if a user's chat data has been migrated
   */
  static async isUserMigrated(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();

      // Check if user still has old conversation history
      const hasOldHistory = userData.conversation_history?.messages?.length > 0;

      // Check if user has new conversation data
      const conversationsRef = collection(db, "conversations");
      const q = query(conversationsRef, where("userId", "==", userId));
      const conversationsSnapshot = await getDocs(q);
      const hasNewData = conversationsSnapshot.size > 0;

      // User is migrated if they have new data and no old data
      return hasNewData && !hasOldHistory;
    } catch (error) {
      console.error(
        `Error checking migration status for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get migration statistics
   */
  static async getMigrationStats(): Promise<{
    totalUsers: number;
    migratedUsers: number;
    pendingUsers: number;
    totalMessages: number;
  }> {
    try {
      // Get all users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      let migratedUsers = 0;
      let pendingUsers = 0;
      let totalMessages = 0;

      // Check each user's migration status
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const hasOldHistory =
          userData.conversation_history?.messages?.length > 0;

        // Check if user has new conversation data
        const conversationsRef = collection(db, "conversations");
        const q = query(conversationsRef, where("userId", "==", userId));
        const conversationsSnapshot = await getDocs(q);
        const hasNewData = conversationsSnapshot.size > 0;

        if (hasNewData && !hasOldHistory) {
          migratedUsers++;
          // Count messages in new structure
          for (const conversationDoc of conversationsSnapshot.docs) {
            const conversationData = conversationDoc.data();
            totalMessages += conversationData.messageCount || 0;
          }
        } else if (hasOldHistory) {
          pendingUsers++;
        }
      }

      return {
        totalUsers,
        migratedUsers,
        pendingUsers,
        totalMessages,
      };
    } catch (error) {
      console.error("Error getting migration stats:", error);
      return {
        totalUsers: 0,
        migratedUsers: 0,
        pendingUsers: 0,
        totalMessages: 0,
      };
    }
  }

  /**
   * Generate a conversation title from the first message
   */
  private static generateConversationTitle(firstMessage: string): string {
    const words = firstMessage.split(" ");
    if (words.length <= 5) {
      return firstMessage;
    }
    return words.slice(0, 5).join(" ") + "...";
  }
}
