import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCourseSchema, 
  insertAssignmentSchema, 
  insertForumSchema,
  insertForumThreadSchema,
  insertForumReplySchema,
  insertMessageSchema,
  insertEventSchema,
  insertDocumentSchema,
  insertSubmissionSchema 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let courses;
      if (user?.role === 'faculty') {
        courses = await storage.getCoursesByInstructor(userId);
      } else if (user?.role === 'student') {
        courses = await storage.getCoursesByStudent(userId);
      } else {
        courses = await storage.getCourses();
      }
      
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'faculty' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to create courses" });
      }

      const courseData = insertCourseSchema.parse({
        ...req.body,
        instructorId: userId
      });
      
      const course = await storage.createCourse(courseData);
      await storage.logActivity(userId, 'create', 'course', course.id);
      
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post('/api/courses/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = req.params.id;
      
      const enrollment = await storage.enrollStudent(courseId, userId);
      await storage.logActivity(userId, 'enroll', 'course', courseId);
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Assignment routes
  app.get('/api/courses/:courseId/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getAssignments(req.params.courseId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/courses/:courseId/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        courseId: req.params.courseId,
        createdBy: userId
      });
      
      const assignment = await storage.createAssignment(assignmentData);
      await storage.logActivity(userId, 'create', 'assignment', assignment.id);
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.get('/api/assignments/:id/submissions', isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getSubmissions(req.params.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post('/api/assignments/:id/submissions', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionData = insertSubmissionSchema.parse({
        assignmentId: req.params.id,
        studentId: userId,
        content: req.body.content,
        filePath: req.file?.path
      });
      
      const submission = await storage.createSubmission(submissionData);
      await storage.logActivity(userId, 'submit', 'assignment', req.params.id);
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Forum routes
  app.get('/api/forums', isAuthenticated, async (req, res) => {
    try {
      const courseId = req.query.courseId as string;
      const forums = await storage.getForums(courseId);
      res.json(forums);
    } catch (error) {
      console.error("Error fetching forums:", error);
      res.status(500).json({ message: "Failed to fetch forums" });
    }
  });

  app.post('/api/forums', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const forumData = insertForumSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const forum = await storage.createForum(forumData);
      await storage.logActivity(userId, 'create', 'forum', forum.id);
      
      res.status(201).json(forum);
    } catch (error) {
      console.error("Error creating forum:", error);
      res.status(500).json({ message: "Failed to create forum" });
    }
  });

  app.get('/api/forums/:id/threads', isAuthenticated, async (req, res) => {
    try {
      const threads = await storage.getForumThreads(req.params.id);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch forum threads" });
    }
  });

  app.post('/api/forums/:id/threads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const threadData = insertForumThreadSchema.parse({
        ...req.body,
        forumId: req.params.id,
        authorId: userId
      });
      
      const thread = await storage.createThread(threadData);
      await storage.logActivity(userId, 'create', 'thread', thread.id);
      
      res.status(201).json(thread);
    } catch (error) {
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  });

  app.get('/api/threads/:id/replies', isAuthenticated, async (req, res) => {
    try {
      const replies = await storage.getThreadReplies(req.params.id);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching thread replies:", error);
      res.status(500).json({ message: "Failed to fetch thread replies" });
    }
  });

  app.post('/api/threads/:id/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        threadId: req.params.id,
        authorId: userId
      });
      
      const reply = await storage.createReply(replyData);
      await storage.logActivity(userId, 'reply', 'thread', req.params.id);
      
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const courseId = req.query.courseId as string;
      const documents = await storage.getDocuments(courseId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: userId
      });
      
      const document = await storage.createDocument(documentData);
      await storage.logActivity(userId, 'upload', 'document', document.id);
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents/:id/download', isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocumentById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      await storage.incrementDownloadCount(document.id);
      res.download(document.filePath, document.fileName);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = req.query.courseId as string;
      const messages = await storage.getMessages(userId, courseId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      
      const message = await storage.createMessage(messageData);
      await storage.logActivity(userId, 'send', 'message', message.id);
      
      // Broadcast to WebSocket clients if available
      broadcastMessage(message);
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const courseId = req.query.courseId as string;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const events = await storage.getEvents(courseId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      // Check for conflicts
      const conflicts = await storage.checkEventConflicts(eventData.startDate, eventData.endDate);
      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Schedule conflict detected", 
          conflicts 
        });
      }
      
      const event = await storage.createEvent(eventData);
      await storage.logActivity(userId, 'create', 'event', event.id);
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/events/conflicts', isAuthenticated, async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const excludeId = req.query.excludeId as string;
      
      const conflicts = await storage.checkEventConflicts(startDate, endDate, excludeId);
      res.json(conflicts);
    } catch (error) {
      console.error("Error checking conflicts:", error);
      res.status(500).json({ message: "Failed to check conflicts" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/analytics/course-stats/:courseId', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getCourseStats(req.params.courseId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching course stats:", error);
      res.status(500).json({ message: "Failed to fetch course stats" });
    }
  });

  app.get('/api/analytics/system-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized to view system stats" });
      }
      
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Activity logs
  app.get('/api/activity-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getActivityLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    verifyClient: (info) => {
      // Allow all connections for now - authentication happens after connection
      console.log('WebSocket connection attempt from:', info.origin);
      return true;
    }
  });

  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection established');
    let authenticated = false;
    let userId: string | null = null;
    
    // Set up authentication timeout
    const authTimeout = setTimeout(() => {
      if (!authenticated) {
        console.log('WebSocket connection timed out - no authentication');
        ws.close(4000, 'Authentication timeout');
      }
    }, 10000); // 10 second timeout
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          if (!data.userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing userId in authentication' }));
            return;
          }
          
          // Clear authentication timeout
          clearTimeout(authTimeout);
          
          // Store authenticated connection
          authenticated = true;
          userId = data.userId;
          clients.set(data.userId, ws);
          
          console.log(`WebSocket authenticated for user: ${data.userId}`);
          ws.send(JSON.stringify({ type: 'authenticated', userId: data.userId }));
        } else if (data.type === 'message') {
          if (!authenticated) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
          }
          // Handle real-time message sending
          const newMessage = await storage.createMessage({
            senderId: data.senderId,
            receiverId: data.receiverId,
            courseId: data.courseId,
            content: data.content,
            type: data.messageType || 'direct'
          });
          
          // Broadcast to recipient
          if (data.receiverId && clients.has(data.receiverId)) {
            const recipientWs = clients.get(data.receiverId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
            }
          }
          
          // Broadcast to course members if it's a course message
          if (data.courseId && data.messageType === 'course') {
            broadcastToCourse(data.courseId, {
              type: 'new_message',
              message: newMessage
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket connection closed: ${code} ${reason}`);
      clearTimeout(authTimeout);
      
      // Remove client from map when disconnected
      if (userId) {
        clients.delete(userId);
        console.log(`Removed authenticated user ${userId} from clients`);
      }
    });
  });

  // Helper function to broadcast messages
  function broadcastMessage(message: any) {
    if (message.receiverId && clients.has(message.receiverId)) {
      const recipientWs = clients.get(message.receiverId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'new_message',
          message
        }));
      }
    }
  }

  function broadcastToCourse(courseId: string, data: any) {
    clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        // In a real implementation, you'd check if the user is enrolled in the course
        ws.send(JSON.stringify(data));
      }
    });
  }

  return httpServer;
}
