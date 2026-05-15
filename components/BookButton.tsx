'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import BookingModal from './BookingModal';

export default function BookButton({ dancerId, dancerName }: { dancerId: string; dancerName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        whileHover={{ y: -3 }}
        whileTap={{ y: -1 }}
        className="relative overflow-hidden w-full bg-gradient-to-br from-purple to-purple-mid text-white font-serif text-[1.1rem] font-semibold tracking-[0.1em] px-4 py-4 rounded-xl shadow-purple-soft hover:shadow-purple-lift transition-shadow group"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-purple-mid to-mint opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        />
        <span className="relative z-10">Book This Dancer</span>
      </motion.button>
      <BookingModal open={open} onClose={() => setOpen(false)} dancerId={dancerId} dancerName={dancerName} />
    </>
  );
}
