// FIX: Create content for pages/CopyrightPage.tsx to resolve module errors.
import React from 'react';
import Card from '../components/ui/Card';

const CopyrightPage: React.FC = () => {
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Bản quyền, Giấy phép & Kiếm tiền</h2>
            <div className="prose dark:prose-invert max-w-none">
                <p>
                    Nội dung (văn bản, hình ảnh, video) được tạo ra bởi Studio Auto ("Dịch vụ") sử dụng các mô hình Trí tuệ Nhân tạo (AI). Quyền sở hữu và việc sử dụng nội dung này tuân theo các điều khoản sau đây để đảm bảo bạn có thể sử dụng sản phẩm một cách an toàn cho mục đích thương mại và kiếm tiền.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-2">1. Quyền sở hữu nội dung thuộc về bạn</h3>
                <p>
                    <strong>Bạn sở hữu tất cả các nội dung bạn tạo ra</strong> bằng cách sử dụng Dịch vụ. Điều này bao gồm cả các prompt bạn nhập và các sản phẩm cuối cùng (văn bản, hình ảnh, video) được AI tạo ra từ những prompt đó. Chúng tôi không yêu cầu bất kỳ quyền sở hữu nào đối với nội dung của bạn.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-2">2. Giấy phép sử dụng cho mục đích thương mại</h3>
                <p>
                    Bạn được cấp phép toàn cầu, vĩnh viễn, miễn phí bản quyền để sử dụng, sao chép, sửa đổi, và phân phối nội dung do bạn tạo ra cho <strong>bất kỳ mục đích nào, bao gồm cả mục đích thương mại và kiếm tiền</strong> trên các nền tảng như YouTube, Facebook, TikTok, v.v.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-2">3. Trách nhiệm của người dùng</h3>
                <p>
                    Mặc dù AI được huấn luyện để tạo ra nội dung gốc, các mô hình có thể vô tình tạo ra kết quả giống với các tác phẩm đã có bản quyền. <strong>Bạn hoàn toàn chịu trách nhiệm pháp lý về nội dung bạn tạo ra và cách bạn sử dụng nó.</strong>
                </p>
                <ul>
                    <li>Trước khi sử dụng nội dung cho mục đích thương mại, bạn nên tự mình kiểm tra để đảm bảo nó không vi phạm bản quyền, thương hiệu, quyền riêng tư, hoặc các quyền sở hữu trí tuệ khác của bên thứ ba.</li>
                    <li>Studio Auto không cung cấp bất kỳ sự đảm bảo nào rằng nội dung được tạo ra là duy nhất và không có tranh chấp pháp lý.</li>
                    <li>Bạn phải tuân thủ các điều khoản dịch vụ và chính sách kiếm tiền của từng nền tảng mà bạn đăng tải nội dung.</li>
                </ul>


                <h3 className="text-xl font-semibold mt-6 mb-2">4. Hạn chế và Miễn trừ trách nhiệm</h3>
                <p>
                    Bạn không được sử dụng Dịch vụ để tạo nội dung bất hợp pháp, có hại, lừa đảo, hoặc vi phạm các điều khoản dịch vụ của chúng tôi. Chúng tôi có quyền đình chỉ quyền truy cập của bạn nếu vi phạm. Studio Auto không chịu trách nhiệm pháp lý đối với bất kỳ khiếu nại nào phát sinh từ nội dung do bạn tạo ra.
                </p>

                <p className="mt-6 text-sm text-gray-500">
                    Chính sách này có thể được cập nhật theo thời gian. Vui lòng kiểm tra lại định kỳ để biết những thay đổi mới nhất. Lần cập nhật cuối: 31/07/2024.
                </p>
            </div>
        </Card>
    );
};

export default CopyrightPage;