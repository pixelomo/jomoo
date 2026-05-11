'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Step1Schema, type Step1Data } from '@/types/registration'
import { PROVINCES } from '@/data/provinces'
import FormField, { inputClass } from '@/components/ui/FormField'
import { useLocale } from 'next-intl'

interface Props {
  defaultValues?: Partial<Step1Data>
  models: { _id: string; name: string; modelCode: string }[]
  onSubmit: (data: Step1Data) => void
}

export default function Step1BasicInfo({ defaultValues, models, onSubmit }: Props) {
  const t = useTranslations('registration.step1')
  const tc = useTranslations('common')
  const locale = useLocale()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(Step1Schema),
    defaultValues,
  })

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value
    const model = models.find((m) => m._id === modelId)
    setValue('modelId', modelId)
    setValue('modelName', model?.name ?? '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hidden modelName field */}
      <input type="hidden" {...register('modelName')} />

      <FormField
        label={t('model')}
        required
        error={errors.modelId?.message ? tc('required') : undefined}
        htmlFor="modelId"
      >
        <select
          id="modelId"
          className={inputClass}
          defaultValue={defaultValues?.modelId ?? ''}
          onChange={handleModelChange}
        >
          <option value="">{t('modelPlaceholder')}</option>
          {models.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.modelCode})
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={t('installationDate')}
        required
        error={errors.installationDate?.message ? tc('required') : undefined}
        htmlFor="installationDate"
      >
        <input
          id="installationDate"
          type="date"
          className={inputClass}
          max={new Date().toISOString().split('T')[0]}
          {...register('installationDate')}
        />
      </FormField>

      <FormField
        label={t('installationAddressState')}
        required
        error={errors.installationAddressState?.message ? tc('required') : undefined}
        htmlFor="installationAddressState"
      >
        <select
          id="installationAddressState"
          className={inputClass}
          defaultValue={defaultValues?.installationAddressState ?? ''}
          {...register('installationAddressState')}
        >
          <option value="">{t('installationAddressStatePlaceholder')}</option>
          {PROVINCES.map((p) => (
            <option key={p.value} value={p.value}>
              {locale === 'zh-CN' ? p.labelZh : p.labelEn}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={t('installationAddressDetail')}
        required
        error={errors.installationAddressDetail?.message ? tc('required') : undefined}
        htmlFor="installationAddressDetail"
      >
        <textarea
          id="installationAddressDetail"
          rows={2}
          className={inputClass}
          placeholder={t('installationAddressDetailPlaceholder')}
          {...register('installationAddressDetail')}
        />
      </FormField>

      <FormField
        label={t('contactPerson')}
        required
        error={errors.contactPerson?.message ? tc('required') : undefined}
        htmlFor="contactPerson"
      >
        <input
          id="contactPerson"
          type="text"
          className={inputClass}
          placeholder={t('contactPersonPlaceholder')}
          {...register('contactPerson')}
        />
      </FormField>

      <FormField
        label={t('phoneNumber')}
        htmlFor="phoneNumber"
      >
        <input
          id="phoneNumber"
          type="tel"
          className={inputClass}
          placeholder={t('phoneNumberPlaceholder')}
          {...register('phoneNumber')}
        />
      </FormField>

      <FormField
        label={t('purchaseDate')}
        htmlFor="purchaseDate"
      >
        <input
          id="purchaseDate"
          type="date"
          className={inputClass}
          max={new Date().toISOString().split('T')[0]}
          {...register('purchaseDate')}
        />
      </FormField>

      <FormField
        label={t('dealerName')}
        htmlFor="dealerName"
      >
        <input
          id="dealerName"
          type="text"
          className={inputClass}
          placeholder={t('dealerNamePlaceholder')}
          {...register('dealerName')}
        />
      </FormField>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          {tc('next')}
        </button>
      </div>
    </form>
  )
}
