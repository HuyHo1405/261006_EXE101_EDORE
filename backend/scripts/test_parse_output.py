# -*- coding: utf-8 -*-
import sys
import os
import json

# Đảm bảo import được backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.sgk_parser import parse_sgk_chunks

raw_extracted_text = u"""BÀI 1: LỊCH SỬ LÀ GÌ?
Học xong bài này, em sẽ:
● Nêu được khái niệm lịch sử và môn Lịch sử.
● Hiểu được lịch sử là những gì đã diễn ra trong quá khứ.
● Giải thích được vì sao cần thiết phải học môn Lịch sử.
● Phân biệt được các nguồn sử liệu cơ bản, ý nghĩa và giá trị
của các nguồn sử liệu.
Lời dẫn
Từ xa xưa, con người đã ý thức được tầm quan trọng của lịch sử.
Xi-xê-rông (Cicero), triết gia của La Mã cổ đại, đã từng nói: "Lịch
sử là thầy dạy của cuộc sống". Bài học này sẽ truyền cảm hứng
cho em suy nghĩ về tầm quan trọng của lịch sử và việc học lịch
sử, giúp các em biết được dựa vào đâu để dựng lại lịch sử một
cách chân thực nhất.
I. LỊCH SỬ VÀ MÔN LỊCH SỬ
Câu hỏi thảo luận:
● Lịch sử là gì? Em hãy nêu một ví dụ cụ thể.
● Theo em, những câu hỏi nào có thể được đặt ra để tìm
hiểu về quá khứ khi quan sát hình 1.1 (Rồng đá trước thềm
Điện Kính Thiên, thế kỉ XV, khu di tích Hoàng Thành Thăng
Long, Hà Nội)?
Khái niệm: Mọi sự vật xung quanh chúng ta đều phát sinh, tồn
tại và biến đổi theo thời gian. Xã hội loài người cũng vậy. Quá
trình đó chính là lịch sử.
● Lịch sử là những gì đã xảy ra trong quá khứ, bao gồm mọi
hoạt động của con người từ khi xuất hiện đến nay.

● Môn Lịch sử là môn khoa học tìm hiểu về lịch sử loài người,
bao gồm toàn bộ những hoạt động của con người và xã
hội loài người trong quá khứ.
II. VÌ SAO PHẢI HỌC LỊCH SỬ?
Em có biết? Để tìm hiểu về một chuyện xảy ra trong
quá khứ, các em cần xác định được những yếu tố cơ
bản là: thời gian, không gian xảy ra và con người liên
quan tới sự kiện đó. Các em cần tự đặt ra và trả lời
những câu hỏi như: Việc đó xảy ra khi nào? Ở đâu? Xảy
ra như thế nào? Vì sao lại xảy ra? Ai liên quan đến việc
đó? Việc đó có ý nghĩa và giá trị gì đối với ngày nay?...
Câu hỏi thảo luận:
● Có ý kiến cho rằng: Lịch sử là những gì đã qua, không thể
thay đổi được nên không cần thiết phải học môn Lịch sử.
Em có đồng ý với ý kiến đó không? Tại sao?
● Em hiểu thế nào về từ “gốc tích” trong câu thơ của Chủ
tịch Hồ Chí Minh? Nêu ý nghĩa câu thơ đó.
Ý nghĩa của việc học Lịch sử: Học lịch sử để biết được cội
nguồn của tổ tiên, quê hương, đất nước; hiểu được ông cha ta
đã phải lao động, sáng tạo, đấu tranh như thế nào để có được
đất nước ngày nay.
"Dân ta phải biết sử ta Cho tường gốc tích nước nhà
Việt Nam". (Lịch sử nước ta, Hồ Chí Minh)
Học lịch sử còn để đúc kết những bài học kinh nghiệm của quá
khứ nhằm phục vụ cho hiện tại và tương lai.
"Dù ai đi ngược về xuôi Nhớ ngày giỗ Tổ mùng Mười
tháng Ba"
III. KHÁM PHÁ QUÁ KHỨ TỪ CÁC NGUỒN SỬ LIỆU

Câu hỏi thảo luận:
● Tư liệu truyền miệng, tư liệu hiện vật, tư liệu chữ viết có ý
nghĩa và giá trị gì?
● Tại sao tư liệu gốc lại có giá trị lịch sử xác thực nhất? Hãy
lấy một ví dụ chứng minh cho ý kiến của em từ một nguồn
sử liệu cụ thể có trong bài.
Các nguồn sử liệu: Quá khứ đã qua và không thể quay lại, chỉ
còn dấu tích của người xưa là ở lại với chúng ta và được lưu giữ
dưới nhiều dạng khác nhau. Đó được gọi là nguồn sử liệu hay tư
liệu lịch sử. Có nhiều nguồn tư liệu khác nhau như tư liệu truyền
miệng, tư liệu hiện vật, tư liệu chữ viết,... Trong các nguồn tư liệu
đó, có những tư liệu được gọi là tư liệu gốc.
● Tư liệu gốc: Là tư liệu liên quan trực tiếp đến sự kiện lịch
sử, ra đời vào thời điểm diễn ra sự kiện, phản ánh sự kiện
lịch sử đó. Đây là nguồn tư liệu đáng tin cậy nhất khi tìm
hiểu lịch sử (Ví dụ: Bản thảo Lời kêu gọi Toàn quốc kháng
chiến của Chủ tịch Hồ Chí Minh, ngày 19-12-1946).
● Tư liệu truyền miệng: Gồm nhiều thể loại như truyền
thuyết, thần thoại, ca dao, dân ca,... được truyền từ đời này
qua đời khác. Trong giai đoạn chưa có chữ viết, tư liệu
truyền miệng được xem là một nguồn thông tin để tìm
hiểu lịch sử (Ví dụ: Truyền thuyết Thánh Gióng).
● Tư liệu chữ viết: Bao gồm các bản chữ khắc trên xương,
mai rùa, vỏ cây, đá, các bản chép tay hay in trên giấy,... ghi
chép tương đối đầy đủ mọi mặt đời sống con người và các
sự kiện lịch sử đã xảy ra (Ví dụ: Bia Tiến sĩ tại Văn Miếu -
Quốc Tử Giám).
● Tư liệu hiện vật: Là những dấu tích vật chất của người xưa
còn giữ được trong lòng đất hay trên mặt đất như các
công trình kiến trúc, các tác phẩm nghệ thuật, đồ gốm,...
Tư liệu hiện vật không chỉ là bằng chứng giúp chúng ta
tìm hiểu và dựng lại lịch sử mà còn được sử dụng để kiểm
chứng các tư liệu chữ viết (Ví dụ: Rìu gót vuông trang trí
cảnh chó săn hươu).
LUYỆN TẬP – VẬN DỤNG
Phần Luyện tập:
2. Tại sao cần thiết phải học môn Lịch sử?
3. Căn cứ vào đâu để biết và dựng lại lịch sử?
Phần Vận dụng:
5. Em biết những di tích lịch sử nào ở địa phương em
đang sống? Hãy kể cho cả lớp nghe về sự kiện lịch sử
liên quan đến một trong những di tích đó.
6. Hãy viết một đoạn văn ngắn về lịch sử ngôi trường
em đang học (trường được thành lập khi nào? Nó
thay đổi như thế nào theo thời gian?...).
7. Cửa Bắc, một công trình kiến trúc cổ, nằm trên phố
Phan Đình Phùng, Hà Nội. Trên tường vẫn còn
nguyên dấu vết đạn pháo của thực dân Pháp khi
đánh chiếm thành Hà Nội năm 1882. Có ý kiến cho
rằng nên trùng tu lại mặt thành, xoá đi những vết đạn
pháo đó. Em có đồng ý với ý kiến đó không? Tại sao?"

# Chuyển đổi mã hóa chuỗi nếu cần
if sys.version_info[0] < 3:
    raw_extracted_text = raw_extracted_text.encode('utf-8')

chunks = parse_sgk_chunks(raw_extracted_text, lop=6)

print("Total chunks parsed: {}".format(len(chunks)))
print("=" * 60)
for i, chunk in enumerate(chunks, 1):
    print("Chunk #{}:".format(i))
    print("  Bài: {} - {}".format(chunk.get('bai_so'), chunk.get('ten_bai')))
    print("  Mục: {} - {}".format(chunk.get('muc'), chunk.get('ten_muc')))
    print("  Loại: {}".format(chunk.get('loai')))
    print("  Keywords: {}".format(chunk.get('tu_khoa')))
    preview = chunk.get('text', '').replace('\n', ' ')
    print("  Text preview: {}...".format(preview[:120]))
    print("-" * 60)
