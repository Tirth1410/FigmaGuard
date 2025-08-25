import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ markdown }) => {
  return (
    <ReactMarkdown 
      children={markdown} 
      remarkPlugins={[remarkGfm]} 
    />
  );
};

export default MarkdownRenderer;