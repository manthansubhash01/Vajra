import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import img1 from "../../assets/maxresdefault.jpg";
import img2 from "../../assets/24927d64-e693-45e3-af3b-2212034d9dcf.__CR0,0,1940,1200_PT0_SX970_V1___.jpeg";
import img3 from "../../assets/5d860528-d905-433c-8402-1a273e2194f0.__CR0,0,970,600_PT0_SX970_V1___.jpg";
import img4 from "../../assets/43b6e216-d007-4bb2-a1f9-ec999101c0fa.__CR0,0,1455,900_PT0_SX970_V1___.jpg";

const HeroSection = () => {
  return (
    <div className="w-full h-screen bg-gray-100 p-4 md:p-6 lg:p-7">
      <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={10}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
        //   navigation
          // pagination={{clickable : true}}
          className="w-full h-full"
        >
          <SwiperSlide>
            <div className="relative w-full h-screen">
              <img
                src={img1}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-screen">
              <img
                src={img2}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-screen">
              <img
                src={img3}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative w-full h-screen">
              <img
                src={img4}
                alt="Slide 1"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default HeroSection;
