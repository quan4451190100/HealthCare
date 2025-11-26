import type { Request, Response } from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "./notifications.model";

export const getNotificationsController = async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notifications = await getUserNotifications(userId);
  const unreadCount = await getUnreadCount(userId);
  
  if (!notifications || unreadCount === undefined) {
    console.error("Get notifications error: data is null");
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(200).json({ 
    notifications,
    unreadCount 
  });
};

export const markAsReadController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!id) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  const notiId = parseInt(id);
  
  if (isNaN(notiId)) {
    return res.status(400).json({ message: "Invalid notification ID" });
  }

  const success = await markAsRead(notiId);
  
  if (!success) {
    return res.status(404).json({ message: "Notification not found" });
  }

  return res.status(200).json({ message: "Notification marked as read" });
};

export const markAllAsReadController = async (req: Request, res: Response) => {
  const userId = (req as any).user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const success = await markAllAsRead(userId);
  
  if (!success) {
    console.error("Mark all as read error: operation failed");
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(200).json({ message: "All notifications marked as read" });
};

export const deleteNotificationController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!id) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  const notiId = parseInt(id);
  
  if (isNaN(notiId)) {
    return res.status(400).json({ message: "Invalid notification ID" });
  }

  const success = await deleteNotification(notiId);
  
  if (!success) {
    return res.status(404).json({ message: "Notification not found" });
  }

  return res.status(200).json({ message: "Notification deleted" });
};
