
import React from 'react';
import Card from '../components/ui/Card';

const Support: React.FC = () => {
  const supportChannels = [
    { name: 'Zalo', value: 'https://zalo.me/g/xxx', link: true },
    { name: 'Facebook', value: 'https://facebook.com/xxx', link: true },
    { name: 'Email', value: 'support@studio-auto.ai', link: false },
    { name: 'Telegram', value: 'Chưa cập nhật', link: false },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center">
          <h2 className="text-3xl font-bold">Hỗ trợ & Liên hệ</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Chúng tôi luôn sẵn sàng giúp đỡ bạn. Vui lòng liên hệ qua các kênh dưới đây.</p>
        </div>
        <div className="mt-8 space-y-4">
          {supportChannels.map(channel => (
            <div key={channel.name} className="flex justify-between items-center p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
              <span className="font-semibold">{channel.name}</span>
              {channel.link ? (
                <a href={channel.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {channel.value}
                </a>
              ) : (
                <span className="text-gray-700 dark:text-gray-300">{channel.value}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Support;
