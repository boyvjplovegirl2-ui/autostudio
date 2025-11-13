import React from 'react';
import { SocialAccount, SocialPost } from '../../types';
import Card from '../ui/Card';
import { UsersIcon, ShareIcon, SparklesIcon } from '../icons/Icons';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface SocialDashboardProps {
    accounts: SocialAccount[];
    posts: SocialPost[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card className="flex items-center">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    </Card>
);

const chartOptions = (title: string, isDarkMode: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: { color: isDarkMode ? '#E5E7EB' : '#374151' }
        },
        title: {
            display: true,
            text: title,
            color: isDarkMode ? '#F9FAFB' : '#111827'
        },
    },
    scales: {
        x: { ticks: { color: isDarkMode ? '#9CA3AF' : '#6B7280' } },
        y: { ticks: { color: isDarkMode ? '#9CA3AF' : '#6B7280' } }
    }
});


const SocialDashboard: React.FC<SocialDashboardProps> = ({ accounts, posts }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.isConnected ? acc.stats.followers : 0), 0);
    const totalEngagement = posts.reduce((sum, post) => sum + post.stats.likes + post.stats.comments + post.stats.shares, 0);
    const totalPosts = posts.filter(p => p.status === 'published').length;

    const followerData = {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
        datasets: [
            { label: 'Facebook', data: [10, 20, 55, 60, 80, 100].map(v => v * 125), borderColor: '#3b5998', backgroundColor: '#3b5998', tension: 0.1 },
            { label: 'YouTube', data: [30, 45, 60, 70, 75, 88].map(v => v * 1000), borderColor: '#FF0000', backgroundColor: '#FF0000', tension: 0.1 },
        ],
    };

    const engagementData = {
        labels: ['Facebook', 'YouTube', 'Instagram', 'TikTok'],
        datasets: [
            {
                label: 'Tỷ lệ tương tác (%)',
                data: [5.2, 8.5, 12.1, 9.8],
                backgroundColor: ['#3b5998', '#FF0000', '#C13584', '#000000'],
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Tổng người theo dõi" value={totalFollowers.toLocaleString('vi-VN')} icon={UsersIcon} />
                <StatCard title="Tổng tương tác (30 ngày)" value={totalEngagement.toLocaleString('vi-VN')} icon={SparklesIcon} />
                <StatCard title="Bài đã đăng" value={totalPosts.toString()} icon={ShareIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="h-80">
                        <Line options={chartOptions('Tăng trưởng Người theo dõi', isDarkMode)} data={followerData} />
                    </div>
                </Card>
                <Card>
                    <div className="h-80">
                         <Bar options={chartOptions('Tỷ lệ tương tác theo Nền tảng', isDarkMode)} data={engagementData} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SocialDashboard;