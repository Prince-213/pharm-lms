"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

export function ContactFormSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section id="contact-form" className="bg-[#f0f0f0] py-10 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-5">
          {/* Left: Form Card */}
          <div className="w-full rounded-[20px] bg-white p-6 lg:w-1/2 lg:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--ink-deep)] sm:text-3xl">
              Send us a Message
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-soft)]">
              Get in touch with our team. Fill out the form below and we&apos;ll
              respond to your inquiry as quickly as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink-deep)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white py-3 px-4 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink-deep)]">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white py-3 px-4 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink-deep)]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white py-3 px-4 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ink-deep)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    className="w-full rounded-lg border border-[#e0e0e0] bg-white py-3 px-4 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--ink-deep)]">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message"
                  rows={5}
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white py-3 px-4 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[var(--emerald)] py-6 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
              >
                Submit Now
              </button>
            </form>
          </div>

          {/* Right: Contact Info Cards */}
          <div className="w-full flex flex-col gap-5 lg:w-1/2">
            {/* Email Card */}
            <div className="flex  gap-5 rounded-[20px] bg-white p-6 lg:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center text-[var(--emerald)]">
                <Image
                  src="/assets/email.png"
                  width={120}
                  height={120}
                  alt=""
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--ink-deep)]">
                  Email us
                </h3>
                <p className="mt-1 text-sm text-[var(--muted-soft)]">
                  Email us for scheduling
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink-deep)]">
                  hello@pharmlms.com
                </p>
              </div>
            </div>

            {/* Visit Office Card */}
            <div className="flex items-center gap-5 rounded-[20px] bg-white p-6 lg:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center text-[var(--emerald)]">
                <Image src="/assets/map.png" width={120} height={120} alt="" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--ink-deep)]">
                  Visit our office
                </h3>
                <p className="mt-1 text-sm text-[var(--muted-soft)]">
                  Visit us for scheduling
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink-deep)]">
                  463 7th Ave, NY 10018, USA
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="flex items-center gap-5 rounded-[20px] bg-white p-6 lg:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center text-[var(--emerald)]">
                <Image src="/assets/call.png" width={120} height={120} alt="" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--ink-deep)]">
                  Contact us
                </h3>
                <p className="mt-1 text-sm text-[var(--muted-soft)]">
                  Call us for scheduling
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink-deep)]">
                  (568) 367-987-237
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
