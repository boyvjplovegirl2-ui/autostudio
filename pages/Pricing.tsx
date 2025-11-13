import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { CheckCircleIcon, XMarkIcon, MomoIcon, CryptoIcon, BanknotesIcon } from '../components/icons/Icons';
import { Plan, PlanName } from '../types';

// The 'updateUserPlan' prop is added to update the user's plan in the App state
interface PricingProps {
    updateUserPlan: (planName: PlanName) => void;
}

const plans: Plan[] = [
    {
        name: "Cá nhân",
        price: "399K/tháng",
        description: "Lý tưởng cho người mới bắt đầu và các dự án nhỏ.",
        features: ["1 thiết bị", "Text-to-Video", "100 credits/tháng", "Hỗ trợ qua email"]
    },
    {
        name: "Cá nhân Pro",
        price: "650K/tháng",
        description: "Dành cho các nhà sáng tạo chuyên nghiệp cần nhiều tài nguyên hơn.",
        features: ["1 thiết bị", "Không giới hạn credits", "Ưu tiên render", "Hỗ trợ 24/7"],
        isPopular: true
    },
    {
        name: "Team",
        price: "1.999K/tháng",
        description: "Hoàn hảo cho các nhóm nhỏ và agency.",
        features: ["5 thiết bị", "Không gian làm việc chung", "Quản lý thành viên", "Tất cả tính năng Pro"]
    },
    {
        name: "Doanh nghiệp",
        price: "9.999K/tháng",
        description: "Giải pháp toàn diện cho các tổ chức lớn.",
        features: ["30 thiết bị", "Server riêng", "Hỗ trợ chuyên biệt", "API access"]
    }
];

const PlanCard: React.FC<{ plan: Plan; onSelect: () => void }> = ({ plan, onSelect }) => (
    <Card className={`flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-primary/20 ${plan.isPopular ? 'border-primary border-2' : ''}`}>
        {plan.isPopular && <div className="text-center bg-primary text-white py-1 rounded-t-lg -mx-6 -mt-6 mb-4">Phổ biến nhất</div>}
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-3xl font-bold my-4">{plan.price}</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
        <ul className="space-y-3 mb-8">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-secondary mr-2" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Button onClick={onSelect} variant={plan.isPopular ? 'primary' : 'outline'} className="w-full mt-auto">Chọn gói</Button>
    </Card>
);

const PaymentModal: React.FC<{
    plan: Plan;
    onClose: () => void;
    onPaymentSuccess: (planName: PlanName) => void;
}> = ({ plan, onClose, onPaymentSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'crypto' | 'bank'>('momo');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success'>('idle');

    const handleConfirmPayment = () => {
        setPaymentStatus('pending');
        // Simulate API call for payment confirmation
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
                onPaymentSuccess(plan.name);
                onClose();
            }, 1500); // Wait a bit on success message before closing
        }, 3000);
    };

    useEffect(() => {
        // Prevent scrolling on the body when the modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const PaymentMethodButton: React.FC<{
        method: 'momo' | 'crypto' | 'bank';
        label: string;
        icon: React.ElementType;
    }> = ({ method, label, icon: Icon }) => (
        <button
            onClick={() => setPaymentMethod(method)}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold border-b-2 transition-colors ${paymentMethod === method ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );

    const renderPaymentContent = () => {
        switch (paymentMethod) {
            case 'momo':
                return (
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Quét mã QR MoMo để thanh toán</h4>
                        <img src="https://picsum.photos/seed/momo/250" alt="MoMo QR Code" className="w-64 h-64 mx-auto my-4 rounded-lg" />
                        <p className="text-sm text-gray-500">Sử dụng ứng dụng MoMo của bạn để quét mã.</p>
                        <p className="font-bold text-lg mt-2">{plan.price.replace('/tháng', '')} VND</p>
                    </div>
                );
            case 'crypto':
                return (
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Chuyển khoản Crypto</h4>
                        <p className="text-sm text-gray-500 mb-2">Mạng lưới: TRC20 | Coin: USDT</p>
                         <img src="https://picsum.photos/seed/crypto/250" alt="Crypto QR Code" className="w-64 h-64 mx-auto my-4 rounded-lg" />
                        <div className="bg-gray-100 dark:bg-dark-bg p-2 rounded-md break-all">
                            <p className="text-xs">TAdsdasjkhSADKJH123jkhasdSAhasdkjh</p>
                        </div>
                    </div>
                );
            case 'bank':
                return (
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Quét mã VietQR</h4>
                        <img src="https://picsum.photos/seed/bank/250" alt="Bank QR Code" className="w-64 h-64 mx-auto my-4 rounded-lg" />
                        <p className="text-sm">Nội dung chuyển khoản:</p>
                        <p className="font-semibold text-primary">EMAIL CUA BAN nang cap goi {plan.name}</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Thanh toán gói {plan.name}</h2>
                    <p className="text-3xl font-bold text-primary my-2">{plan.price}</p>
                </div>

                {paymentStatus === 'idle' && (
                    <>
                        <div className="flex border-b border-light-border dark:border-dark-border mb-6">
                            <PaymentMethodButton method="momo" label="MoMo" icon={MomoIcon} />
                            <PaymentMethodButton method="crypto" label="Crypto" icon={CryptoIcon} />
                            <PaymentMethodButton method="bank" label="Ngân hàng" icon={BanknotesIcon} />
                        </div>
                        <div className="mb-6">{renderPaymentContent()}</div>
                        <Button onClick={handleConfirmPayment} className="w-full" size="lg">Xác nhận đã thanh toán</Button>
                    </>
                )}

                {paymentStatus === 'pending' && (
                    <div className="text-center py-12">
                        <Loader message="Đang chờ xác nhận thanh toán..." />
                        <p className="text-sm text-gray-500 mt-2">Hệ thống đang tự động kiểm tra giao dịch.</p>
                    </div>
                )}
                
                {paymentStatus === 'success' && (
                     <div className="text-center py-12">
                        <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
                        <h3 className="text-xl font-bold">Thanh toán thành công!</h3>
                        <p className="text-gray-500 mt-1">Gói {plan.name} của bạn đã được kích hoạt.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

const Pricing: React.FC<PricingProps> = ({ updateUserPlan }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Chọn gói phù hợp với bạn</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Mở khóa toàn bộ tiềm năng sáng tạo với các gói nâng cấp của chúng tôi.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map(plan => (
                    <PlanCard key={plan.name} plan={plan} onSelect={() => handleSelectPlan(plan)} />
                ))}
            </div>

            {isModalOpen && selectedPlan && (
                <PaymentModal 
                    plan={selectedPlan} 
                    onClose={handleCloseModal} 
                    onPaymentSuccess={updateUserPlan}
                />
            )}
        </div>
    );
};

export default Pricing;