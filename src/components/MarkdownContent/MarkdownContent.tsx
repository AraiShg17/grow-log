import styles from './MarkdownContent.module.css';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className={styles.content}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} className={styles.heading}>
              {trimmed.replace(/^##\s+/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').map((line) => line.replace(/^-\s+/, ''));
          return (
            <ul key={index} className={styles.list}>
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className={styles.paragraph}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
