import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all" // all, products, services, jobs
    const limit = parseInt(searchParams.get("limit") || "20")

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: any = {
      products: [],
      services: [],
      jobs: [],
    }

    // Search in Ready Products
    if (type === "all" || type === "products") {
      const products = await prisma.readyProduct.findMany({
        where: {
          status: "APPROVED",
          deletedAt: null,
          OR: [
            { titleAr: { contains: query, mode: "insensitive" } },
            { titleEn: { contains: query, mode: "insensitive" } },
            { descriptionAr: { contains: query, mode: "insensitive" } },
            { descriptionEn: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
          ],
        },
        take: limit,
        orderBy: [{ salesCount: "desc" }, { averageRating: "desc" }],
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          descriptionAr: true,
          descriptionEn: true,
          images: true,
          price: true,
          discountPrice: true,
          averageRating: true,
          salesCount: true,
          category: true,
          subcategory: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profileImage: true,
              averageRating: true,
            },
          },
        },
      })

      results.products = products.map((p) => ({
        ...p,
        type: "product",
      }))
    }

    // Search in Custom Services
    if (type === "all" || type === "services") {
      const services = await prisma.customService.findMany({
        where: {
          status: "APPROVED",
          deletedAt: null,
          OR: [
            { titleAr: { contains: query, mode: "insensitive" } },
            { titleEn: { contains: query, mode: "insensitive" } },
            { descriptionAr: { contains: query, mode: "insensitive" } },
            { descriptionEn: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
          ],
        },
        take: limit,
        orderBy: [{ ordersCount: "desc" }, { averageRating: "desc" }],
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          descriptionAr: true,
          descriptionEn: true,
          images: true,
          averageRating: true,
          ordersCount: true,
          category: true,
          subcategory: true,
          packages: {
            orderBy: { price: "asc" },
            take: 1,
            select: {
              price: true,
              deliveryDays: true,
            },
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profileImage: true,
              averageRating: true,
            },
          },
        },
      })

      results.services = services.map((s) => ({
        ...s,
        type: "service",
        startingPrice: s.packages[0]?.price || 0,
      }))
    }

    // Search in Freelance Jobs
    if (type === "all" || type === "jobs") {
      const jobs = await prisma.freelanceJob.findMany({
        where: {
          status: "OPEN",
          deletedAt: null,
          OR: [
            { titleAr: { contains: query, mode: "insensitive" } },
            { titleEn: { contains: query, mode: "insensitive" } },
            { descriptionAr: { contains: query, mode: "insensitive" } },
            { descriptionEn: { contains: query, mode: "insensitive" } },
            { requiredSkills: { hasSome: [query] } },
          ],
        },
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          descriptionAr: true,
          descriptionEn: true,
          budgetMin: true,
          budgetMax: true,
          budgetType: true,
          projectDuration: true,
          experienceLevel: true,
          requiredSkills: true,
          category: true,
          createdAt: true,
          _count: {
            select: {
              proposals: true,
            },
          },
          buyer: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profileImage: true,
            },
          },
        },
      })

      results.jobs = jobs.map((j) => ({
        ...j,
        type: "job",
        proposalsCount: j._count.proposals,
      }))
    }

    // Combine and limit total results
    const allResults = [
      ...results.products,
      ...results.services,
      ...results.jobs,
    ].slice(0, limit)

    return NextResponse.json({
      query,
      count: allResults.length,
      results: type === "all" ? allResults : results[type + "s"] || [],
      breakdown: {
        products: results.products.length,
        services: results.services.length,
        jobs: results.jobs.length,
      },
    })
  } catch (error) {
    console.error("Error in search:", error)
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
}
