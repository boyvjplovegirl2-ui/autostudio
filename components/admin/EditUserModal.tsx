import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { XMarkIcon } from '../icons/Icons';

interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: AdminUser) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<AdminUser>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'credits' ? parseInt(value, 10) : value }));
  };

  const handleSave = () => {
    onSave(formData as AdminUser);
    onClose();
  };

  const planOptions = [
    { value: 'Cá nhân', label: 'Cá nhân' },
    { value: 'Cá nhân Pro', label: 'Cá nhân Pro' },
    { value: 'Team', label: 'Team' },
    { value: 'Doanh nghiệp', label: 'Doanh nghiệp' },
    { value: 'Chưa kích hoạt', label: 'Chưa kích hoạt' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' },
  ];
  
  const countryOptions = [
    { value: 'Vietnam', label: 'Việt Nam' },
    { value: 'USA', label: 'Hoa Kỳ' },
    { value: 'Other', label: 'Khác' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng: {user.email}</h2>
        <div className="space-y-4">
          <Input label="Email" value={user.email} disabled />
          <Input label="Họ và Tên" name="name" value={formData.name || ''} onChange={handleChange} />
          <Input label="Số điện thoại" name="phone" value={formData.phone || ''} onChange={handleChange} />
          <Select label="Quốc gia" name="country" options={countryOptions} value={formData.country || 'Vietnam'} onChange={handleChange} />
          <hr className="border-light-border dark:border-dark-border my-2" />
          <Select label="Gói tài khoản" name="plan" options={planOptions} value={formData.plan} onChange={handleChange} />
          <Input label="Credits" name="credits" type="number" value={formData.credits} onChange={handleChange} />
          <Select label="Trạng thái" name="status" options={statusOptions} value={formData.status} onChange={handleChange} />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      </Card>
    </div>
  );
};

export default EditUserModal;