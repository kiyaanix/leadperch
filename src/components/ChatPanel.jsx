import { useState, useCallback } from "react";
import { ChatHeader } from "./ChatHeader.jsx";
import { ChatForm, STATUS } from "./ChatForm.jsx";
import { SuccessMessage } from "./SuccessMessage.jsx";
import { ChatFooter } from "./ChatFooter.jsx";

export function ChatPanel({ config, onClose }) {
  const [succeeded, setSucceeded] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  // Holds the actual visitor-entered name from the submitted form data
  // (looked up by config.nameFieldId), never a placeholder or company name.
  const [visitorName, setVisitorName] = useState("");

  const handleSuccess = useCallback(
    (submittedData, response = {}) => {
      setVisitorName((submittedData && submittedData[config.nameFieldId]) || "");
      setCooldownSeconds(Number(response.cooldown_seconds) || 0);
      setSucceeded(true);
    },
    [config.nameFieldId]
  );
  const handleReset = useCallback(() => {
    setSucceeded(false);
    setVisitorName("");
  }, []);

  return (
    <div className="cw-panel" role="dialog" aria-label={`${config.companyName} chat`}>
      <ChatHeader config={config} onClose={onClose} />

      <div className="cw-body">
        {succeeded ? (
          <SuccessMessage
            heading={config.successHeading}
            message={config.successMessage}
            name={visitorName}
            onReset={handleReset}
          />
        ) : (
          <>
            {config.greeting ? <div className="cw-greeting">{config.greeting}</div> : null}
            <ChatForm
              config={config}
              initialCooldownSeconds={cooldownSeconds}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </div>

      <ChatFooter text={config.poweredByText} url={config.poweredByUrl} />
    </div>
  );
}

export { STATUS };
