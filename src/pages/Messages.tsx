import { useParams } from "react-router-dom";
import ChatModule from "@/components/ChatModule";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();

  const currentUserId = user?._id || localStorage.getItem("userId") || "";

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gold/3 blur-[160px]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-terra/3 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
        <ChatModule 
          initialChatUserId={userId || null} 
          currentUserId={currentUserId} 
        />
      </div>
    </div>
  );
}
