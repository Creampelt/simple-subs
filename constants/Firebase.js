import { initializeApp, firestore as db, auth as firebaseAuth } from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIV-fwIGwS9sNbGxHH_kCTbx_BbpAJC2s",
  authDomain: "sandwich-orders.firebaseapp.com",
  projectId: "sandwich-orders"
};

initializeApp(firebaseConfig);

export const firestore = db();
export const auth = firebaseAuth;

export const authErrorMessage = (error) => {
  switch (error.code) {
    case "auth/invalid-user-token":
      return {
        title: "Invalid User Credential",
        message: "The current user's credential is no longer valid. Please sign in again."
      };
    case "auth/network-request-failed":
      return {
        title: "No Internet Connection",
        message: "Could not connect to server. Please ensure you are connected to a network."
      };
    case "auth/wrong-password":
      return {
        title: "Incorrect Password",
        message: "The password you entered was incorrect."
      };
    case "auth/user-not-found":
      return {
        title: "Invalid Email",
        message: "There is no user with that email address. You may need to create an account."
      };
    default:
      return {
        title: "Error",
        message: "Something went wrong. Please try again later."
      };
  }
};

export const firestoreErrorMessage = (error) => {
  switch (error.code) {
    case "not-found":
      return {
        title: "Not Found",
        message: "Couldn't find the requested document."
      };
    case "already-exists":
      return {
        title: "Document Already Exists",
        message: "The document you tried to create already exists."
      };
    case "permission-denied":
      return {
        title: "Permission Denied",
        message: "You do not have permission to execute this action."
      };
    case "cancelled":
      return {
        title: "Cancelled",
        message: "The operation was cancelled."
      };
    case "unimplemented":
      return {
        title: "Not Allowed",
        message: "This action is not allowed."
      };
    case "data-loss":
      return {
        title: "Data Loss",
        message: "Some data may have been lost or corrupted when executing this action."
      };
    case "unauthenticated":
      return {
        title: "Invalid Authentication",
        message: "Your authentication credentials are invalid. Try logging out and back in again."
      };
    default:
      return {
        title: "Error",
        message: "Something went wrong. Please try again later."
      }
  }
}