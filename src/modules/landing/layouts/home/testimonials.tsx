import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/core/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/core/components/ui/carousel";
import { zoomInAnimation, zoomUpAnimation } from "@/core/utils/animations/motion";
import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function TestimonialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const testimonials = [
    {
      title: "Game Changer!",
      content:
        "QuizRX transformed the way we assess our medical interns. The AI-driven insights are invaluable.",
      name: "Dr. Sarah Johnson",
      occupation: "Medical Director",
      avatar: "/images/person.svg?height=40&width=40",
    },
    {
      title: "Incredible Platform!",
      content:
        "The adaptive learning system has revolutionized our training program. Students are more engaged than ever.",
      name: "Prof. Michael Chen",
      occupation: "Head of Education",
      avatar: "/images/person.svg?height=40&width=40",
    },
    {
      title: "Outstanding Results!",
      content:
        "Our pass rates have improved significantly since implementing QuizRX. The analytics are incredibly detailed.",
      name: "Dr. Emily Rodriguez",
      occupation: "Training Coordinator",
      avatar: "/images/person.svg?height=40&width=40",
    },
    {
      title: "Game Changer!",
      content:
        "QuizRX transformed the way we assess our medical interns. The AI-driven insights are invaluable.",
      name: "Dr. James Wilson",
      occupation: "Clinical Supervisor",
      avatar: "/images/person.svg?height=40&width=40",
    },
  ];

  const totalSlides = Math.ceil(testimonials.length / 3);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <motion.div
      id="testimonials"
      initial="hidden"
      animate="show"
      variants={zoomInAnimation}
      className="w-full bg-[#F5F7FA] py-16 px-4 md:px-8 rounded-3xl"
    >
      <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto">
        <Badge 
          variant="outline" 
          className="bg-white text-black border-0 shadow-sm px-4 py-2 rounded-full text-sm font-medium"
        >
          Testimonial
        </Badge>
        
        <motion.h2
          variants={zoomUpAnimation}
          className="text-4xl md:text-5xl font-bold text-center text-[#212121]"
        >
          What Our Customers Say
        </motion.h2>

        <div className="relative w-full">
          <Carousel
            className="w-full"
            opts={{
              startIndex: currentSlide,
              align: "start",
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <CarouselItem key={slideIndex} className="pl-2 md:pl-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials
                      .slice(slideIndex * 3, (slideIndex + 1) * 3)
                      .map((testimonial, index) => (
                        <Card 
                          key={slideIndex * 3 + index}
                          className="bg-white border-0 shadow-lg rounded-2xl h-full"
                        >
                          <CardContent className="p-6 space-y-4">
                            <motion.h3
                              variants={zoomUpAnimation}
                              className="text-xl font-semibold text-[#212121]"
                            >
                              {testimonial.title}
                            </motion.h3>
                            
                            <motion.p
                              variants={zoomUpAnimation}
                              className="text-[#616161] text-sm leading-relaxed"
                            >
                              {testimonial.content}
                            </motion.p>
                            
                            <motion.div
                              variants={zoomUpAnimation}
                              className="flex items-center gap-3 pt-2"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={testimonial.avatar}
                                  alt={testimonial.name}
                                />
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                  {testimonial.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-[#212121]">
                                  {testimonial.name}
                                </p>
                                <p className="text-xs text-[#9E9E9E]">
                                  {testimonial.occupation}
                                </p>
                              </div>
                            </motion.div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious 
              className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 bg-transparent border-0 shadow-none hover:bg-transparent"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6 text-black" />
            </CarouselPrevious>
            
            <CarouselNext 
              className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 bg-transparent border-0 shadow-none hover:bg-transparent"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6 text-black" />
            </CarouselNext>
          </Carousel>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentSlide 
                  ? 'bg-[#4285F4]' 
                  : 'bg-[#D9D9D9]'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
