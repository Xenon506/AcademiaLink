import {
  users,
  courses,
  courseEnrollments,
  forums,
  forumThreads,
  forumReplies,
  assignments,
  submissions,
  documents,
  documentVersions,
  messages,
  events,
  notifications,
  activityLogs,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Forum,
  type InsertForum,
  type ForumThread,
  type InsertForumThread,
  type ForumReply,
  type InsertForumReply,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type Document,
  type InsertDocument,
  type DocumentVersion,
  type Message,
  type InsertMessage,
  type Event,
  type InsertEvent,
  type Notification,
  type InsertNotification,
  type ActivityLog,
  type CourseEnrollment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, sql, like, gte, lte, isNull, inArray, ne } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course>;
  enrollStudent(courseId: string, studentId: string): Promise<CourseEnrollment>;
  unenrollStudent(courseId: string, studentId: string): Promise<void>;

  // Forum operations
  getForums(courseId?: string): Promise<Forum[]>;
  getForumById(id: string): Promise<Forum | undefined>;
  createForum(forum: InsertForum): Promise<Forum>;
  updateForum(id: string, updates: Partial<InsertForum>): Promise<Forum>;
  deleteForum(id: string): Promise<void>;
  getForumThreads(forumId: string): Promise<ForumThread[]>;
  getThreadById(id: string): Promise<ForumThread | undefined>;
  createThread(thread: InsertForumThread): Promise<ForumThread>;
  updateThread(id: string, updates: Partial<InsertForumThread>): Promise<ForumThread>;
  deleteThread(id: string): Promise<void>;
  getThreadReplies(threadId: string): Promise<ForumReply[]>;
  createReply(reply: InsertForumReply): Promise<ForumReply>;
  updateReply(id: string, updates: Partial<InsertForumReply>): Promise<ForumReply>;
  deleteReply(id: string): Promise<void>;

  // Assignment operations
  getAssignments(courseId: string): Promise<Assignment[]>;
  getAssignmentById(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  getSubmissions(assignmentId: string): Promise<Submission[]>;
  getSubmissionByStudentAndAssignment(studentId: string, assignmentId: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission>;
  deleteSubmission(id: string): Promise<void>;

  // Document operations
  getDocuments(courseId?: string): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  createDocumentVersion(version: Omit<DocumentVersion, 'id' | 'createdAt'>): Promise<DocumentVersion>;
  incrementDownloadCount(documentId: string): Promise<void>;

  // Message operations
  getMessages(userId: string, courseId?: string): Promise<Message[]>;
  getConversation(senderId: string, receiverId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message>;
  deleteMessage(id: string): Promise<void>;
  markMessageAsRead(id: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Event operations
  getEvents(courseId?: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  checkEventConflicts(startDate: Date, endDate: Date, excludeId?: string): Promise<Event[]>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Analytics operations
  getUserStats(userId: string): Promise<any>;
  getCourseStats(courseId: string): Promise<any>;
  getSystemStats(): Promise<any>;

  // Activity log operations
  logActivity(userId: string, action: string, entityType: string, entityId: string, details?: any): Promise<ActivityLog>;
  getActivityLogs(userId?: string, limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.createdAt));
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    return await db.select({
      id: courses.id,
      name: courses.name,
      code: courses.code,
      description: courses.description,
      instructorId: courses.instructorId,
      status: courses.status,
      semester: courses.semester,
      year: courses.year,
      maxStudents: courses.maxStudents,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .innerJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
    .where(eq(courseEnrollments.studentId, studentId))
    .orderBy(desc(courses.createdAt));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async enrollStudent(courseId: string, studentId: string): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({ courseId, studentId })
      .returning();
    return enrollment;
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    await db
      .delete(courseEnrollments)
      .where(and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.studentId, studentId)
      ));
  }

  // Forum operations
  async getForums(courseId?: string): Promise<Forum[]> {
    const query = db.select().from(forums);
    if (courseId) {
      return await query.where(eq(forums.courseId, courseId)).orderBy(desc(forums.createdAt));
    }
    return await query.orderBy(desc(forums.createdAt));
  }

  async getForumById(id: string): Promise<Forum | undefined> {
    const [forum] = await db.select().from(forums).where(eq(forums.id, id));
    return forum;
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const [newForum] = await db.insert(forums).values(forum).returning();
    return newForum;
  }

  async updateForum(id: string, updates: Partial<InsertForum>): Promise<Forum> {
    const [updatedForum] = await db
      .update(forums)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forums.id, id))
      .returning();
    return updatedForum;
  }

  async deleteForum(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // First get all thread IDs in this forum
      const threadIds = await tx.select({ id: forumThreads.id })
        .from(forumThreads)
        .where(eq(forumThreads.forumId, id));
      
      if (threadIds.length > 0) {
        const threadIdValues = threadIds.map(t => t.id);
        // Delete all replies for these threads
        await tx.delete(forumReplies)
          .where(inArray(forumReplies.threadId, threadIdValues));
        
        // Delete all threads in this forum
        await tx.delete(forumThreads).where(eq(forumThreads.forumId, id));
      }
      
      // Finally delete the forum
      await tx.delete(forums).where(eq(forums.id, id));
    });
  }

  async getForumThreads(forumId: string): Promise<ForumThread[]> {
    return await db.select().from(forumThreads)
      .where(eq(forumThreads.forumId, forumId))
      .orderBy(desc(forumThreads.isPinned), desc(forumThreads.createdAt));
  }

  async getThreadById(id: string): Promise<ForumThread | undefined> {
    const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    return thread;
  }

  async createThread(thread: InsertForumThread): Promise<ForumThread> {
    const [newThread] = await db.insert(forumThreads).values(thread).returning();
    return newThread;
  }

  async updateThread(id: string, updates: Partial<InsertForumThread>): Promise<ForumThread> {
    const [updatedThread] = await db
      .update(forumThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumThreads.id, id))
      .returning();
    return updatedThread;
  }

  async deleteThread(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete all replies in this thread
      await tx.delete(forumReplies).where(eq(forumReplies.threadId, id));
      // Delete the thread
      await tx.delete(forumThreads).where(eq(forumThreads.id, id));
    });
  }

  async getThreadReplies(threadId: string): Promise<ForumReply[]> {
    return await db.select().from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(forumReplies.createdAt);
  }

  async createReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    return newReply;
  }

  async updateReply(id: string, updates: Partial<InsertForumReply>): Promise<ForumReply> {
    const [updatedReply] = await db
      .update(forumReplies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumReplies.id, id))
      .returning();
    return updatedReply;
  }

  async deleteReply(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Helper function to recursively delete replies within the same transaction
      const deleteReplyTree = async (replyId: string): Promise<void> => {
        // Get all child replies
        const childReplies = await tx.select({ id: forumReplies.id })
          .from(forumReplies)
          .where(eq(forumReplies.parentId, replyId));
        
        // Recursively delete all children first
        for (const child of childReplies) {
          await deleteReplyTree(child.id);
        }
        
        // Delete this reply
        await tx.delete(forumReplies).where(eq(forumReplies.id, replyId));
      };
      
      await deleteReplyTree(id);
    });
  }

  // Assignment operations
  async getAssignments(courseId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(eq(assignments.courseId, courseId))
      .orderBy(desc(assignments.dueDate));
  }

  async getAssignmentById(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: string, updates: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete all submissions for this assignment
      await tx.delete(submissions).where(eq(submissions.assignmentId, id));
      // Delete the assignment
      await tx.delete(assignments).where(eq(assignments.id, id));
    });
  }

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionByStudentAndAssignment(studentId: string, assignmentId: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions)
      .where(and(
        eq(submissions.studentId, studentId),
        eq(submissions.assignmentId, assignmentId)
      ));
    return submission;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  async updateSubmission(id: string, updates: Partial<InsertSubmission>): Promise<Submission> {
    const [updatedSubmission] = await db
      .update(submissions)
      .set(updates)
      .where(eq(submissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async deleteSubmission(id: string): Promise<void> {
    await db.delete(submissions).where(eq(submissions.id, id));
  }

  // Document operations
  async getDocuments(courseId?: string): Promise<Document[]> {
    const query = db.select().from(documents);
    if (courseId) {
      return await query.where(eq(documents.courseId, courseId)).orderBy(desc(documents.createdAt));
    }
    return await query.orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete all versions for this document
      await tx.delete(documentVersions).where(eq(documentVersions.documentId, id));
      // Delete the document
      await tx.delete(documents).where(eq(documents.id, id));
    });
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return await db.select().from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.version));
  }

  async createDocumentVersion(version: Omit<DocumentVersion, 'id' | 'createdAt'>): Promise<DocumentVersion> {
    const [newVersion] = await db.insert(documentVersions).values(version).returning();
    return newVersion;
  }

  async incrementDownloadCount(documentId: string): Promise<void> {
    await db
      .update(documents)
      .set({ downloadCount: sql`${documents.downloadCount} + 1` })
      .where(eq(documents.id, documentId));
  }

  // Message operations
  async getMessages(userId: string, courseId?: string): Promise<Message[]> {
    const query = db.select().from(messages);
    if (courseId) {
      return await query
        .where(and(
          eq(messages.courseId, courseId),
          eq(messages.type, 'course')
        ))
        .orderBy(desc(messages.createdAt));
    }
    return await query
      .where(or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      ))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(senderId: string, receiverId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(or(
        and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)),
        and(eq(messages.senderId, receiverId), eq(messages.receiverId, senderId))
      ))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      ));
    return result.count;
  }

  // Event operations
  async getEvents(courseId?: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    const conditions = [];

    if (courseId) {
      conditions.push(eq(events.courseId, courseId));
    }
    if (startDate) {
      conditions.push(gte(events.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(events.endDate, endDate));
    }

    if (conditions.length > 0) {
      return await db.select().from(events)
        .where(and(...conditions))
        .orderBy(events.startDate);
    }

    return await db.select().from(events).orderBy(events.startDate);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async checkEventConflicts(startDate: Date, endDate: Date, excludeId?: string): Promise<Event[]> {
    const timeConflictConditions = or(
      and(
        lte(events.startDate, startDate),
        gte(events.endDate, startDate)
      ),
      and(
        lte(events.startDate, endDate),
        gte(events.endDate, endDate)
      ),
      and(
        gte(events.startDate, startDate),
        lte(events.endDate, endDate)
      )
    );

    if (excludeId) {
      return await db.select().from(events)
        .where(and(
          timeConflictConditions,
          ne(events.id, excludeId)
        ));
    }

    return await db.select().from(events)
      .where(timeConflictConditions);
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set(updates)
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<any> {
    // Get user's courses, assignments, submissions, messages, etc.
    const [coursesCount] = await db
      .select({ count: count() })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.studentId, userId));

    const [submissionsCount] = await db
      .select({ count: count() })
      .from(submissions)
      .where(eq(submissions.studentId, userId));

    const [messagesCount] = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.senderId, userId));

    return {
      coursesEnrolled: coursesCount.count,
      submissionsCount: submissionsCount.count,
      messagesSent: messagesCount.count,
    };
  }

  async getCourseStats(courseId: string): Promise<any> {
    const [studentsCount] = await db
      .select({ count: count() })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId));

    const [assignmentsCount] = await db
      .select({ count: count() })
      .from(assignments)
      .where(eq(assignments.courseId, courseId));

    const [forumsCount] = await db
      .select({ count: count() })
      .from(forums)
      .where(eq(forums.courseId, courseId));

    return {
      studentsEnrolled: studentsCount.count,
      assignmentsCount: assignmentsCount.count,
      forumsCount: forumsCount.count,
    };
  }

  async getSystemStats(): Promise<any> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [coursesCount] = await db.select({ count: count() }).from(courses);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    const [documentsCount] = await db.select({ count: count() }).from(documents);

    return {
      totalUsers: usersCount.count,
      totalCourses: coursesCount.count,
      totalMessages: messagesCount.count,
      totalDocuments: documentsCount.count,
    };
  }

  // Activity log operations
  async logActivity(userId: string, action: string, entityType: string, entityId: string, details?: any): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLogs)
      .values({
        userId,
        action,
        entityType,
        entityId,
        details,
      })
      .returning();
    return activity;
  }

  async getActivityLogs(userId?: string, limit: number = 50): Promise<ActivityLog[]> {
    if (userId) {
      return await db.select().from(activityLogs)
        .where(eq(activityLogs.userId, userId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }

    return await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
