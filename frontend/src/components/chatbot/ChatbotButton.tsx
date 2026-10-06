import { MessagesSquare, X } from 'lucide-react';
import agroBuddy from '../../assets/images/agro-buddy.png';

interface ChatbotButtonProps {
  open: boolean;
  onClick: () => void;
}

export function ChatbotButton({ open, onClick }: ChatbotButtonProps) {
  return (
    <div className="relative flex items-end justify-end">

      <button
        type="button"
        onClick={onClick}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        className="group relative focus-visible:outline-none"
      >
        {open ? (
          /* =========================
             CHAT OPEN → CLOSE BUTTON
          ========================== */
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-full
              bg-brand-forest
              text-white
              shadow-xl
              transition-all duration-300
              hover:scale-105
              hover:bg-brand-deep
              sm:h-[52px] sm:w-[52px]
            "
          >
            <X className="h-5 w-5" />
          </div>
        ) : (
          /* =========================
             CHAT CLOSED → AGRO BUDDY
          ========================== */
          <div
            className="
              relative
              flex items-end
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            {/* Message card */}
            <div
              className="
                mb-2 mr-[-12px]
                hidden
                min-w-[205px]
                rounded-2xl
                border border-green-200
                bg-white
                px-4 py-3
                text-left
                shadow-[0_10px_35px_rgba(31,77,58,0.16)]
                sm:block
              "
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-brand-forest">
                  Hey there!
                </span>

                <span className="text-sm">🌿</span>
              </div>

              <p className="mt-1 text-xs leading-4 text-gray-500">
                Need help? Chat with our
                <br />
                AgroTourism Buddy!
              </p>
            </div>

            {/* Mascot */}
            <div className="relative">
              <div className="animate-agro-buddy-wave">
                <img
                  src={agroBuddy}
                  alt="Agro Tourism Buddy"
                  className="
                    h-[105px]
                    w-auto
                    object-contain
                    drop-shadow-[0_10px_15px_rgba(0,0,0,0.18)]
                    transition-transform duration-300
                    group-hover:scale-[1.04]
                    sm:h-[125px]
                  "
                />
              </div>

              {/* Chat icon */}
              <div
                className="
                  absolute
                  bottom-0
                  right-0
                  flex h-11 w-11
                  items-center justify-center
                  rounded-full
                  border-2 border-white
                  bg-brand-forest
                  text-white
                  shadow-lg
                  transition-transform duration-300
                  group-hover:scale-110
                "
              >
                <MessagesSquare className="h-5 w-5" />
              </div>

              {/* Online dot */}
              <span
                className="
                  absolute
                  right-1
                  top-2
                  h-3 w-3
                  rounded-full
                  border-2 border-white
                  bg-green-400
                "
              />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
