import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import Storage from '/imports/ui/services/storage/in-memory';
import Tooltip from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  cancel: {
    id: 'app.chat.toolbar.reply.cancel',
    description: '',
  },
});

const CANCEL_KEY = 'Esc';

const ChatReplyIntention = () => {
  const [username, setUsername] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [emphasizedMessage, setEmphasizedMessage] = useState<boolean>();
  const [sequence, setSequence] = useState<number>();
  const intl = useIntl();
  const { animations } = useSettings(SETTINGS.APPLICATION) as {
    animations: boolean;
  };

  const hidden = !username || !message;
  const messageChunks = message ? message.split('\n') : null;

  useEffect(() => {
    const handleReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(e.detail.username);
        setMessage(e.detail.message);
        setEmphasizedMessage(e.detail.emphasizedMessage);
        setSequence(e.detail.sequence);
      }
    };

    const handleCancelReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(undefined);
        setMessage(undefined);
        setEmphasizedMessage(undefined);
        setSequence(undefined);
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
    window.addEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !hidden) {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hidden]);

  return (
    <Styled.Container
      $hidden={hidden}
      $animations={animations}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
        Storage.removeItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST);
        if (sequence) Storage.setItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, sequence);
      }}
    >
      <Styled.Message>
        <Styled.Markdown
          $emphasizedMessage={!!emphasizedMessage}
        >
          {messageChunks ? messageChunks[0] : ''}
        </Styled.Markdown>
      </Styled.Message>
      <Tooltip title={intl.formatMessage(intlMessages.cancel, { 0: CANCEL_KEY })}>
        <Styled.CloseBtn
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
            );
          }}
          icon="close"
          tabIndex={hidden ? -1 : 0}
          aria-hidden={hidden}
          aria-label={intl.formatMessage(intlMessages.cancel, { 0: CANCEL_KEY })}
        />
      </Tooltip>
    </Styled.Container>
  );
};

export default ChatReplyIntention;
