import { db } from "../config/firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  deleteDoc,
  getDoc,
  updateDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";

export interface ChatMessage {
  id?: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
  seen?: boolean;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    povImageUrl?: string;
  };
}

export interface Chat {
  id: string;
  userId: string;
  lifeResumeId: string;
  companionName: string;
  companionRelationship: string;
  title?: string;
  messageCount: number;
  lastMessage?: ChatMessage;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";
const MESSAGES_PER_PAGE = 50;

export class ChatService {
  /**
   * Find or create a chat for a user (single chat per user)
   */
  static async findOrCreateChat(
    userId: string,
    lifeResumeId: string,
    companionName: string,
    companionRelationship: string
  ): Promise<string> {
    try {
      console.log(`Finding or creating chat for user ${userId}`);

      // Use userId as document ID for single chat per user
      const chatRef = doc(db, CHATS_COLLECTION, userId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        console.log(`Chat found for user ${userId}`);
        return userId;
      }

      // Create new chat
      const chatData: Omit<Chat, "id"> = {
        userId,
        lifeResumeId,
        companionName,
        companionRelationship,
        title: `Chat with ${companionName}`,
        messageCount: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        isActive: true,
      };

      await setDoc(chatRef, chatData);
      console.log(`Created new chat for user ${userId}`);
      return userId;
    } catch (error) {
      console.error("Error finding or creating chat:", error);
      throw error;
    }
  }

  /**
   * Save a message to the user's chat
   */
  static async saveMessage(
    userId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: any,
    companionName?: string,
    companionRelationship?: string
  ): Promise<void> {
    try {
      console.log(`Saving message for user ${userId}, role: ${role}`);

      // Ensure chat exists
      if (companionName && companionRelationship) {
        await this.findOrCreateChat(
          userId,
          userId,
          companionName,
          companionRelationship
        );
      }

      // Create message
      const messageData: Omit<ChatMessage, "id"> = {
        userId,
        role,
        content,
        timestamp: serverTimestamp() as Timestamp,
        seen: role === "user",
        ...(metadata && { metadata }),
      };

      // Add message to chat's messages subcollection
      const messagesRef = collection(
        db,
        CHATS_COLLECTION,
        userId,
        MESSAGES_COLLECTION
      );
      const messageRef = await addDoc(messagesRef, messageData);

      // Update chat metadata
      const chatRef = doc(db, CHATS_COLLECTION, userId);
      await updateDoc(chatRef, {
        messageCount: messageData.timestamp, // This will be updated properly
        lastMessage: messageData,
        updatedAt: serverTimestamp(),
      });

      console.log(`Message saved for user ${userId}`);
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  /**
   * Get messages for a user's chat
   */
  static async getMessages(
    userId: string,
    pageSize: number = MESSAGES_PER_PAGE,
    lastMessageId?: string
  ): Promise<ChatMessage[]> {
    try {
      console.log(`Getting messages for user ${userId}`);

      const messagesRef = collection(
        db,
        CHATS_COLLECTION,
        userId,
        MESSAGES_COLLECTION
      );
      let q = query(messagesRef, orderBy("timestamp", "desc"), limit(pageSize));

      if (lastMessageId) {
        const lastMessageDoc = doc(messagesRef, lastMessageId);
        const lastMessageSnap = await getDoc(lastMessageDoc);
        if (lastMessageSnap.exists()) {
          q = query(
            messagesRef,
            orderBy("timestamp", "desc"),
            startAfter(lastMessageSnap),
            limit(pageSize)
          );
        }
      }

      const messagesSnap = await getDocs(q);
      const messages: ChatMessage[] = [];

      messagesSnap.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
        } as ChatMessage);
      });

      // Reverse to get chronological order
      messages.reverse();
      console.log(`Retrieved ${messages.length} messages for user ${userId}`);
      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  /**
   * Get user's chat
   */
  static async getChat(userId: string): Promise<Chat | null> {
    try {
      console.log(`Getting chat for user ${userId}`);

      const chatRef = doc(db, CHATS_COLLECTION, userId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const data = chatSnap.data();
        const chat: Chat = {
          id: userId,
          ...data,
        } as Chat;
        console.log(`Chat found for user ${userId}`);
        return chat;
      }

      console.log(`No chat found for user ${userId}`);
      return null;
    } catch (error) {
      console.error("Error getting chat:", error);
      return null;
    }
  }

  /**
   * Delete user's chat
   */
  static async deleteChat(userId: string): Promise<void> {
    try {
      console.log(`Deleting chat for user ${userId}`);

      // Delete all messages in the chat
      await this.clearChatMessages(userId);

      // Delete the chat document
      const chatRef = doc(db, CHATS_COLLECTION, userId);
      await deleteDoc(chatRef);

      console.log(`Chat deleted for user ${userId}`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  }

  /**
   * Clear a user's entire chat (deletes the chat document and all messages)
   */
  static async clearChatMessages(userId: string): Promise<void> {
    try {
      console.log(`🧹 ChatService: Clearing chat for user ${userId}`);

      const chatRef = doc(db, CHATS_COLLECTION, userId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        console.log(`📁 ChatService: Chat document found for user ${userId}`);

        // First, delete all messages in the subcollection
        console.log(
          `🗑️ ChatService: Deleting all messages in subcollection...`
        );
        const messagesRef = collection(
          db,
          CHATS_COLLECTION,
          userId,
          MESSAGES_COLLECTION
        );
        const messagesSnapshot = await getDocs(messagesRef);

        if (!messagesSnapshot.empty) {
          console.log(
            `📝 ChatService: Found ${messagesSnapshot.size} messages to delete`
          );

          // Process in batches of 500 (Firestore batch limit) for cost efficiency
          const batchSize = 500;
          const batches = [];

          for (let i = 0; i < messagesSnapshot.docs.length; i += batchSize) {
            const batch = writeBatch(db);
            const batchDocs = messagesSnapshot.docs.slice(i, i + batchSize);

            batchDocs.forEach((doc) => {
              batch.delete(doc.ref);
            });

            batches.push(batch.commit());
          }

          // Execute all batches in parallel
          await Promise.all(batches);
          console.log(
            `✅ ChatService: Deleted ${
              messagesSnapshot.size
            } messages in ${Math.ceil(
              messagesSnapshot.docs.length / batchSize
            )} batches`
          );
        } else {
          console.log(`ℹ️ ChatService: No messages found in subcollection`);
        }

        // Then delete the chat document
        console.log(`🗑️ ChatService: Deleting chat document...`);
        await deleteDoc(chatRef);

        console.log(
          `✅ ChatService: Successfully deleted chat document and all messages for user ${userId}`
        );
      } else {
        console.log(
          `ℹ️ ChatService: No chat document found for user ${userId} - nothing to delete`
        );
      }

      console.log(`✅ ChatService: Chat cleared for user ${userId}`);
    } catch (error) {
      console.error("❌ ChatService: Error clearing chat:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Check if a user has a chat document (which means they have messages)
   */
  static async hasMessages(userId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, userId);
      const chatDoc = await getDoc(chatRef);
      return chatDoc.exists();
    } catch (error) {
      console.error("Error checking for chat document:", error);
      return false;
    }
  }

  /**
   * Archive old chats (not applicable for single chat per user)
   */
  static async archiveOldChats(daysOld: number = 30): Promise<void> {
    console.log(
      "Archive function not applicable for single chat per user architecture"
    );
  }
}
