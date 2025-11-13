import React from 'react';
import { SocialPost } from '../../types';
import Card from '../ui/Card';

interface PostHistoryProps {
    posts: SocialPost[];
}

const PostHistory: React.FC<PostHistoryProps> = ({ posts }) => {
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Lịch sử bài đăng ({posts.length})</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-light-bg dark:bg-dark-bg">
                        <tr>
                            <th className="p-3">Nội dung</th>
                            <th className="p-3">Nền tảng</th>
                            <th className="p-3">Ngày đăng</th>
                            <th className="p-3 text-center">Likes</th>
                            <th className="p-3 text-center">Comments</th>
                            <th className="p-3 text-center">Shares/Views</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length > 0 ? posts.map(post => (
                            <tr key={post.id} className="border-b border-light-border dark:border-dark-border">
                                <td className="p-3 max-w-xs">
                                    <p className="truncate">{post.content}</p>
                                </td>
                                <td className="p-3 font-medium">{post.platform}</td>
                                <td className="p-3 text-gray-500">{post.publishAt.toLocaleDateString('vi-VN')}</td>
                                <td className="p-3 text-center">{post.stats.likes.toLocaleString('vi-VN')}</td>
                                <td className="p-3 text-center">{post.stats.comments.toLocaleString('vi-VN')}</td>
                                <td className="p-3 text-center">
                                    {post.platform === 'YouTube' 
                                        ? `${(post.stats.views || 0).toLocaleString('vi-VN')} views`
                                        : post.stats.shares.toLocaleString('vi-VN')
                                    }
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-gray-500">
                                    Không có bài đăng nào trong lịch sử.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default PostHistory;