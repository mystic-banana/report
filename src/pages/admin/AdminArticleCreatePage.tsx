import React from 'react';
import ArticleForm from '../../components/admin/ArticleForm';

const AdminArticleCreatePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Create New Article</h1>
      <ArticleForm />
    </div>
  );
};

export default AdminArticleCreatePage;
