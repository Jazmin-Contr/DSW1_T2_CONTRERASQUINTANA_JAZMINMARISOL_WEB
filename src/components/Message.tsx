interface MessageProps {
  type?: 'success' | 'error' | 'info' | '';
  text?: string;
}

const Message = ({ type = '', text = '' }: MessageProps) => {
  if (!type || !text) return null;

  return (
    <div className={`message message-${type}`}>
      {text}
    </div>
  );
};

export default Message;