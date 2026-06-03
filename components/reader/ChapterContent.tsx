import ReactMarkdown from 'react-markdown';

interface ChapterContentProps {
  content: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}

const fontSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const lineHeightClasses = {
  sm: 'leading-relaxed',
  md: 'leading-relaxed',
  lg: 'leading-loose',
  xl: 'leading-loose',
};

export function ChapterContent({ content, fontSize }: ChapterContentProps) {
  return (
    <article
      className={`prose prose-invert dark:prose-invert max-w-2xl mx-auto px-4 py-8 ${fontSizeClasses[fontSize]} ${lineHeightClasses[fontSize]} dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-gray-200 dark:prose-em:text-gray-300 dark:prose-li:text-gray-300`}
    >
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-6 text-gray-900 dark:text-white" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mt-4 mb-3 text-gray-900 dark:text-white" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-800 dark:text-gray-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-300" {...props} />
          ),
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-400"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-gray-900 dark:text-gray-200"
                {...props}
              />
            ) : (
              <code className="block bg-gray-200 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4" {...props} />
            ),
          hr: () => <hr className="my-8 border-gray-300 dark:border-gray-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
