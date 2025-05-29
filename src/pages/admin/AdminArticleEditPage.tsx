import React from 'react';
import { useParams } from 'react-router-dom';
import ArticleForm from '../../components/admin/ArticleForm';

const AdminArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    // This case should ideally be handled by routing or a redirect
    return <p className="text-red-500">Article ID is missing.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Edit Article</h1>
      <ArticleForm articleId={id} />
    </div>
  );
};

export default AdminArticleEditPage;
