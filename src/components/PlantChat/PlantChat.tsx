'use client';

import { sendPlantChatMessageAction } from '@/app/actions/plantChat';
import { MaterialIcon } from '@/components/MaterialIcon/MaterialIcon';
import { icons } from '@/icons';
import { parseInlineMarkdownLinks } from '@/lib/markdown/parseInlineMarkdownLinks';
import type { PlantChatMessageDto } from '@/types/plant';
import { useEffect, useRef, useState, useTransition } from 'react';
import styles from './PlantChat.module.css';

interface PlantChatProps {
  plantId: string;
  plantName: string;
  initialMessages: PlantChatMessageDto[];
}

function renderMessageContent(content: string) {
  return parseInlineMarkdownLinks(content).map((part, index) =>
    part.type === 'link' ? (
      <a
        key={index}
        href={part.href}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {part.label}
      </a>
    ) : (
      <span key={index}>{part.value}</span>
    ),
  );
}

export function PlantChat({ plantId, plantName, initialMessages }: PlantChatProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, pending]);

  function closeChat() {
    setOpen(false);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) {
      return;
    }

    setError(null);
    const optimisticUser: PlantChatMessageDto = {
      id: `pending-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUser]);
    setInput('');

    startTransition(async () => {
      const result = await sendPlantChatMessageAction(plantId, trimmed);
      if (!result.success || !result.messages) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        setError(result.error ?? '送信に失敗しました。');
        setInput(trimmed);
        return;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        ...result.messages!,
      ]);
    });
  }

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        aria-label={`${plantName}についてAIに質問`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <MaterialIcon name={icons.chat} label="AIチャット" />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={closeChat}
        onCancel={(event) => {
          event.preventDefault();
          closeChat();
        }}
      >
        <div className={styles.shell}>
          <header className={styles.header}>
            <div className={styles.headerText}>
              <h2 className={styles.title}>{plantName}</h2>
              <p className={styles.subtitle}>
                登録情報と直近の観察記録をもとに回答します
              </p>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="チャットを閉じる"
              onClick={closeChat}
            >
              <MaterialIcon name={icons.close} size="sm" />
            </button>
          </header>

          <div
            className={styles.messageList}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 && !pending ? (
              <p className={styles.empty}>
                水やりのタイミング、葉の調子など、この植物について質問してみましょう。
              </p>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  styles.bubbleRow,
                  message.role === 'user'
                    ? styles.bubbleRowUser
                    : styles.bubbleRowAssistant,
                ].join(' ')}
              >
                <div
                  className={[
                    styles.bubble,
                    message.role === 'user'
                      ? styles.bubbleUser
                      : styles.bubbleAssistant,
                  ].join(' ')}
                >
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}

            {pending ? (
              <div className={[styles.bubbleRow, styles.bubbleRowAssistant].join(' ')}>
                <div
                  className={[
                    styles.bubble,
                    styles.bubbleAssistant,
                    styles.bubblePending,
                  ].join(' ')}
                >
                  考えています…
                </div>
              </div>
            ) : null}

            <div ref={listEndRef} aria-hidden />
          </div>

          <footer className={styles.footer}>
            {error ? <p className={styles.error}>{error}</p> : null}
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor={`plant-chat-input-${plantId}`}>
                メッセージ
              </label>
              <textarea
                id={`plant-chat-input-${plantId}`}
                className={styles.input}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="質問を入力…"
                rows={2}
                disabled={pending}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={pending || !input.trim()}
              >
                送信
              </button>
            </form>
          </footer>
        </div>
      </dialog>
    </>
  );
}
