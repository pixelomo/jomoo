import { desc, eq, sql } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { user, productRegistration } from '@/lib/db/schema'
import { csvResponse, toCsv } from '@/lib/csv'

/** Every member with their profile and registration count, as a spreadsheet. */
export async function GET() {
  if (!(await getAdminSession())) {
    return new Response('Unauthorized', { status: 401 })
  }

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      companyName: user.companyName,
      companyNameKana: user.companyNameKana,
      lastName: user.lastName,
      firstName: user.firstName,
      lastNameKana: user.lastNameKana,
      firstNameKana: user.firstNameKana,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      postalCode: user.postalCode,
      prefecture: user.prefecture,
      city: user.city,
      streetAddress: user.streetAddress,
      building: user.building,
      createdAt: user.createdAt,
      registrations: sql<number>`count(${productRegistration.id})::int`,
    })
    .from(user)
    .leftJoin(productRegistration, eq(productRegistration.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))

  const csv = toCsv(
    [
      '会員ID', '氏名', 'メールアドレス', 'メール認証済み',
      '会社名', '会社名フリガナ', '姓', '名', 'セイ', 'メイ',
      '性別', '生年月日', '電話番号', '郵便番号', '都道府県', '市区町村', '番地', '建物名',
      '登録日', '製品登録数',
    ],
    rows.map((r) => [
      r.id, r.name, r.email, r.emailVerified ? 'はい' : 'いいえ',
      r.companyName, r.companyNameKana, r.lastName, r.firstName, r.lastNameKana, r.firstNameKana,
      r.gender, r.dateOfBirth, r.phoneNumber, r.postalCode, r.prefecture, r.city, r.streetAddress, r.building,
      r.createdAt, r.registrations,
    ])
  )

  return csvResponse('jomoo-members', csv)
}
