// utils/cloudinaryHelper.ts (Create this or add to your existing cloudinary file)

export const extractPublicIdFromUrl = (url: string): string => {
  // Example URL: https://res.cloudinary.com/cloudname/image/upload/v1690000/travel-plans/my-image.jpg
  
  const parts = url.split("/");
  const lastSegment = parts.pop(); // my-image.jpg
  const folder = parts.pop(); // travel-plans (or whatever structure you have)
  
  // If your folder structure is deeper, you might need a regex, but this works for standard 1-level folders
  // Or simpler regex approach:
  const regex = /\/([^/]+)\/([^/]+)\.[a-z]+$/;
  const match = url.match(regex);
  // This depends heavily on your specific folder structure in Cloudinary
  
  // ROBUST METHOD:
  // Split by 'upload/' and take the second part, then remove extension
  const splitUrl = url.split("upload/");
  if (splitUrl.length < 2) return "";
  
  const pathWithVersion = splitUrl[1]; // v123213/folder/filename.jpg
  const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, ""); // folder/filename.jpg
  const publicId = pathWithoutVersion.split(".")[0]; // folder/filename
  
  return publicId;
};