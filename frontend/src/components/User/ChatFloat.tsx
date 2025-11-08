import { useState } from "react"
import { FaRobot, FaXmark } from "react-icons/fa6"
import Chat from "../../pages/Chat"

const ChatFloat = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <div className="float-container">
      {isOpen && 
      <div className="chat-container">
        <Chat/>
        </div>}
      {isOpen?
      (<button onClick={()=>{setIsOpen(prev=>!prev)}} className="assistant-button close-assistant"><FaXmark/></button>):
      (<button onClick={()=>{setIsOpen(prev=>!prev)}} className="assistant-button"><FaRobot/></button>)
      }
    </div>
  )
}

export default ChatFloat
