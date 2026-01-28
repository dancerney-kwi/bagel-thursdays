'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { BAGEL_TYPES } from '@/lib/constants/bagels';
import { UI } from '@/lib/constants/config';
import type { BagelType, BagelTypeId } from '@/lib/types';

interface BagelCardProps {
  bagel: BagelType;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: BagelTypeId) => void;
}

function BagelCard({ bagel, isSelected, isDisabled, onSelect }: BagelCardProps) {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(bagel.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault();
      onSelect(bagel.id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`Select ${bagel.name} bagel`}
      className={`
        relative flex flex-col items-center rounded-xl border-2 p-4 transition-all
        focus:outline-none focus:ring-4 focus:ring-primary/20
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-gray-light/30 bg-white hover:border-primary/30 hover:shadow-md'
        }
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all
          ${isSelected ? 'border-primary bg-primary' : 'border-gray-light/40 bg-white'}
        `}
      >
        {isSelected && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Bagel image */}
      <div className="mb-2 flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        <Image
          src={`/images/bagels/${bagel.imageFile}`}
          alt={`${bagel.name} bagel`}
          width={64}
          height={64}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Bagel name */}
      <span
        className={`text-center text-sm font-semibold ${
          isSelected ? 'text-primary' : 'text-foreground'
        }`}
      >
        {bagel.name}
      </span>
    </button>
  );
}

interface BagelSelectorProps {
  selectedBagel: BagelTypeId | null;
  customBagel: string;
  onBagelSelect: (id: BagelTypeId) => void;
  onCustomBagelChange: (value: string) => void;
  disabled?: boolean;
}

export default function BagelSelector({
  selectedBagel,
  customBagel,
  onBagelSelect,
  onCustomBagelChange,
  disabled = false,
}: BagelSelectorProps) {
  const handleCustomInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, UI.CUSTOM_BAGEL_MAX_LENGTH);
      onCustomBagelChange(value);
    },
    [onCustomBagelChange]
  );

  return (
    <div className="space-y-4">
      <fieldset disabled={disabled}>
        <legend className="sr-only">Select your bagel type</legend>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {BAGEL_TYPES.map((bagel) => (
            <BagelCard
              key={bagel.id}
              bagel={bagel}
              isSelected={selectedBagel === bagel.id}
              isDisabled={disabled}
              onSelect={onBagelSelect}
            />
          ))}
        </div>
      </fieldset>

      {/* Custom bagel input - shown when "Other" is selected */}
      {selectedBagel === 'other' && (
        <div className="mt-4">
          <label
            htmlFor="custom-bagel"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            What kind of bagel would you like?
          </label>
          <input
            type="text"
            id="custom-bagel"
            value={customBagel}
            onChange={handleCustomInputChange}
            disabled={disabled}
            placeholder="Enter your bagel preference..."
            maxLength={UI.CUSTOM_BAGEL_MAX_LENGTH}
            className={`
              w-full rounded-xl border-2 border-gray-light/30 bg-gray-light/5 px-4 py-3 font-medium text-foreground
              placeholder:text-gray-light/70
              focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          />
          <p className="mt-1.5 text-xs font-medium text-gray">
            {customBagel.length}/{UI.CUSTOM_BAGEL_MAX_LENGTH} characters
          </p>
        </div>
      )}
    </div>
  );
}
