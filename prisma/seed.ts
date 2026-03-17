import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.propertyListItem.deleteMany();
  await prisma.propertyList.deleteMany();
  await prisma.destinationLink.deleteMany();
  await prisma.destinationCategory.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.city.deleteMany();

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Adama",
      email: "admin@adama.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create cities
  const cities = await Promise.all([
    prisma.city.create({
      data: { name: "北京", pinyin: "Beijing", province: "北京市" },
    }),
    prisma.city.create({
      data: { name: "上海", pinyin: "Shanghai", province: "上海市" },
    }),
    prisma.city.create({
      data: { name: "广州", pinyin: "Guangzhou", province: "广东省" },
    }),
    prisma.city.create({
      data: { name: "深圳", pinyin: "Shenzhen", province: "广东省" },
    }),
    prisma.city.create({
      data: { name: "成都", pinyin: "Chengdu", province: "四川省" },
    }),
  ]);

  // Create agencies
  const agencies = await Promise.all([
    prisma.agency.create({
      data: {
        name: "Beijing Home Agency",
        cityId: cities[0].id,
        address: "朝阳区建国门外大街1号",
        email: "contact@bjhome.cn",
        phone: "+86 10 8888 0001",
        contactPerson: "王明",
        status: "ACTIVE",
      },
    }),
    prisma.agency.create({
      data: {
        name: "Shanghai Living Co.",
        cityId: cities[1].id,
        address: "浦东新区陆家嘴环路100号",
        email: "info@shliving.cn",
        phone: "+86 21 6666 0001",
        contactPerson: "李华",
        status: "ACTIVE",
      },
    }),
    prisma.agency.create({
      data: {
        name: "GZ Apartment Partners",
        cityId: cities[2].id,
        address: "天河区珠江新城花城大道50号",
        email: "hello@gzapt.cn",
        phone: "+86 20 3333 0001",
        contactPerson: "张伟",
        status: "ACTIVE",
      },
    }),
  ]);

  // Create agent users
  const agentPassword = await hash("agent123", 12);
  await Promise.all([
    prisma.user.create({
      data: {
        name: "Agent Beijing",
        email: "agent.bj@adama.com",
        password: agentPassword,
        role: "AGENT",
        agencyId: agencies[0].id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Agent Shanghai",
        email: "agent.sh@adama.com",
        password: agentPassword,
        role: "AGENT",
        agencyId: agencies[1].id,
      },
    }),
  ]);

  // Create viewer
  await prisma.user.create({
    data: {
      name: "Viewer Demo",
      email: "viewer@adama.com",
      password: await hash("viewer123", 12),
      role: "VIEWER",
    },
  });

  // Create properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: "Appartement moderne Sanlitun",
        slug: "appartement-moderne-sanlitun",
        type: "APARTMENT",
        listingType: "ENTIRE_PLACE",
        status: "RENTED",
        agencyId: agencies[0].id,
        cityId: cities[0].id,
        address: "三里屯太古里北区3号楼",
        district: "朝阳区 Chaoyang",
        floor: 12,
        building: "太古里北区",
        surfaceArea: 85,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        maxGuests: 4,
        totalRooms: 4,
        furnishing: "FURNISHED",
        amenities: ["wifi", "kitchen", "ac", "heating", "washer", "tv", "elevator"],
        monthlyRent: 8500,
        deposit: 17000,
        commissionRate: 10,
        utilities: 500,
        discountMonthly: 5,
        discountQuarterly: 10,
        discountYearly: 15,
        leaseStartDate: new Date("2025-06-01"),
        leaseEndDate: new Date("2026-06-01"),
        description: "Beautiful modern apartment in the heart of Sanlitun, walking distance to bars, restaurants and shopping.",
        descriptionCn: "三里屯核心地段现代公寓，步行即可到达酒吧、餐厅和购物中心。",
        isFeatured: true,
      },
    }),
    prisma.property.create({
      data: {
        title: "Studio cosy Jing'an Temple",
        slug: "studio-cosy-jingan-temple",
        type: "STUDIO",
        listingType: "ENTIRE_PLACE",
        status: "RENTED",
        agencyId: agencies[1].id,
        cityId: cities[1].id,
        address: "静安区南京西路1000号",
        district: "静安区 Jing'an",
        floor: 8,
        surfaceArea: 45,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        maxGuests: 2,
        furnishing: "FURNISHED",
        amenities: ["wifi", "kitchen", "ac", "washer", "tv"],
        monthlyRent: 6000,
        deposit: 12000,
        commissionRate: 8,
        utilities: 300,
        discountMonthly: 5,
        discountQuarterly: 12,
        leaseStartDate: new Date("2025-07-01"),
        leaseEndDate: new Date("2026-07-01"),
        description: "Cozy studio near Jing'an Temple station, perfect for solo travelers or couples.",
        descriptionCn: "静安寺地铁站附近的温馨工作室，适合独行旅客或情侣。",
      },
    }),
    prisma.property.create({
      data: {
        title: "Villa avec jardin Tianhe",
        slug: "villa-jardin-tianhe",
        type: "VILLA",
        listingType: "ENTIRE_PLACE",
        status: "RENTED",
        agencyId: agencies[2].id,
        cityId: cities[2].id,
        address: "天河区华景路88号",
        district: "天河区 Tianhe",
        surfaceArea: 200,
        bedrooms: 4,
        beds: 5,
        bathrooms: 3,
        maxGuests: 8,
        totalRooms: 8,
        furnishing: "FURNISHED",
        amenities: ["wifi", "kitchen", "parking", "pool", "ac", "heating", "washer", "dryer", "tv"],
        monthlyRent: 15000,
        deposit: 30000,
        commissionRate: 12,
        utilities: 1200,
        discountMonthly: 8,
        discountQuarterly: 15,
        discountYearly: 20,
        leaseStartDate: new Date("2025-03-01"),
        leaseEndDate: new Date("2026-03-01"),
        description: "Spacious villa with private garden in Tianhe district. Perfect for families.",
        descriptionCn: "天河区带私人花园的宽敞别墅，非常适合家庭居住。",
        isFeatured: true,
      },
    }),
    prisma.property.create({
      data: {
        title: "Loft industriel 798 Art Zone",
        slug: "loft-industriel-798",
        type: "LOFT",
        listingType: "ENTIRE_PLACE",
        status: "AVAILABLE",
        agencyId: agencies[0].id,
        cityId: cities[0].id,
        address: "朝阳区酒仙桥路798艺术区",
        district: "朝阳区 Chaoyang",
        floor: 3,
        surfaceArea: 120,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        maxGuests: 4,
        totalRooms: 5,
        furnishing: "SEMI_FURNISHED",
        amenities: ["wifi", "kitchen", "ac", "heating", "washer"],
        monthlyRent: 12000,
        deposit: 24000,
        commissionRate: 10,
        utilities: 800,
        discountMonthly: 5,
        discountQuarterly: 10,
        description: "Industrial-style loft near 798 Art Zone, high ceilings and open space.",
        descriptionCn: "798艺术区附近工业风阁楼，高层高开放空间。",
      },
    }),
    prisma.property.create({
      data: {
        title: "Chambre privée Pudong",
        slug: "chambre-privee-pudong",
        type: "ROOM",
        listingType: "PRIVATE_ROOM",
        status: "RENTED",
        agencyId: agencies[1].id,
        cityId: cities[1].id,
        address: "浦东新区世纪大道200号",
        district: "浦东新区 Pudong",
        floor: 15,
        surfaceArea: 20,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        maxGuests: 1,
        furnishing: "FURNISHED",
        amenities: ["wifi", "ac", "tv", "elevator"],
        monthlyRent: 3500,
        deposit: 7000,
        commissionRate: 8,
        utilities: 200,
        discountMonthly: 3,
        leaseStartDate: new Date("2025-09-01"),
        leaseEndDate: new Date("2026-03-01"),
        description: "Private room in shared apartment near Century Avenue station.",
        descriptionCn: "世纪大道地铁站附近合租公寓中的私人房间。",
      },
    }),
    prisma.property.create({
      data: {
        title: "Appartement vue mer Nanshan",
        slug: "appartement-vue-mer-nanshan",
        type: "APARTMENT",
        listingType: "ENTIRE_PLACE",
        status: "RENTED",
        agencyId: agencies[2].id,
        cityId: cities[3].id,
        address: "南山区蛇口海上世界",
        district: "南山区 Nanshan",
        floor: 22,
        building: "海上世界双玺",
        surfaceArea: 110,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        maxGuests: 6,
        totalRooms: 5,
        furnishing: "FURNISHED",
        amenities: ["wifi", "kitchen", "parking", "ac", "washer", "dryer", "tv", "elevator"],
        monthlyRent: 11000,
        deposit: 22000,
        commissionRate: 10,
        utilities: 700,
        discountMonthly: 5,
        discountQuarterly: 10,
        discountYearly: 18,
        leaseStartDate: new Date("2025-04-01"),
        leaseEndDate: new Date("2026-04-01"),
        description: "Sea-view apartment in Shekou, Nanshan district. Close to Sea World.",
        descriptionCn: "南山区蛇口海景公寓，紧邻海上世界。",
        isFeatured: true,
      },
    }),
    prisma.property.create({
      data: {
        title: "Maison traditionnelle Chengdu",
        slug: "maison-traditionnelle-chengdu",
        type: "HOUSE",
        listingType: "ENTIRE_PLACE",
        status: "AVAILABLE",
        agencyId: agencies[2].id,
        cityId: cities[4].id,
        address: "锦江区太古里附近",
        district: "锦江区 Jinjiang",
        surfaceArea: 150,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2,
        maxGuests: 6,
        totalRooms: 7,
        furnishing: "FURNISHED",
        amenities: ["wifi", "kitchen", "ac", "heating", "washer", "tv"],
        monthlyRent: 7000,
        deposit: 14000,
        commissionRate: 10,
        utilities: 400,
        discountMonthly: 5,
        discountQuarterly: 12,
        discountYearly: 20,
        description: "Traditional Chinese house near Taikoo Li, perfect blend of old and new Chengdu.",
        descriptionCn: "太古里附近传统中式住宅，完美融合了成都的古今风貌。",
      },
    }),
  ]);

  // Generate 12 months of payments for rented properties
  const rentedProperties = properties.filter(
    (p) => p.status === "RENTED"
  );

  for (const property of rentedProperties) {
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const period = new Date(2025, 2 + monthOffset, 1); // Start from March 2025
      const dueDate = new Date(2025, 2 + monthOffset, 5);
      const isPast = period < new Date();
      const commission =
        Number(property.monthlyRent) *
        (Number(property.commissionRate) / 100);

      await prisma.payment.create({
        data: {
          propertyId: property.id,
          period,
          amountDue: property.monthlyRent,
          amountPaid: isPast ? property.monthlyRent : 0,
          commission,
          dueDate,
          paymentDate: isPast ? new Date(period.getFullYear(), period.getMonth(), 3) : null,
          status: isPast ? "PAID" : monthOffset === 12 ? "OVERDUE" : "PENDING",
        },
      });
    }
  }

  // Create a test conversation
  const agentBj = await prisma.user.findFirst({
    where: { email: "agent.bj@adama.com" },
  });

  if (agentBj) {
    const conversation = await prisma.conversation.create({
      data: {
        subject: "Question sur l'appartement Sanlitun",
        propertyId: properties[0].id,
        participants: {
          create: [
            { userId: admin.id },
            { userId: agentBj.id },
          ],
        },
        messages: {
          create: [
            {
              senderId: agentBj.id,
              content: "Bonjour, le locataire actuel souhaite prolonger son bail de 6 mois. Est-ce possible ?",
            },
            {
              senderId: admin.id,
              content: "Oui, pas de problème. Préparez un avenant au contrat et envoyez-le moi pour validation.",
            },
          ],
        },
      },
    });
  }

  // ─── Destination Categories (for "Des idées pour vos prochaines escapades") ───
  await prisma.destinationCategory.create({
    data: {
      name: "Populaire",
      slug: "populaire",
      icon: "flame",
      order: 0,
      links: {
        create: [
          { title: "Beijing", subtitle: "北京 · Logements", order: 0 },
          { title: "Shanghai", subtitle: "上海 · Logements", order: 1 },
          { title: "Guangzhou", subtitle: "广州 · Logements", order: 2 },
          { title: "Shenzhen", subtitle: "深圳 · Logements", order: 3 },
          { title: "Chengdu", subtitle: "成都 · Logements", order: 4 },
          { title: "Hangzhou", subtitle: "杭州 · Logements", order: 5 },
        ],
      },
    },
  });

  await prisma.destinationCategory.create({
    data: {
      name: "Quartiers modernes",
      slug: "quartiers-modernes",
      icon: "building-2",
      order: 1,
      links: {
        create: [
          { title: "Pudong, Shanghai", subtitle: "陆家嘴 · Appartements", order: 0 },
          { title: "Chaoyang, Beijing", subtitle: "朝阳区 · Studios", order: 1 },
          { title: "Nanshan, Shenzhen", subtitle: "南山区 · Lofts", order: 2 },
          { title: "Tianhe, Guangzhou", subtitle: "天河区 · Appartements", order: 3 },
          { title: "Gaoxin, Chengdu", subtitle: "高新区 · Studios", order: 4 },
        ],
      },
    },
  });

  await prisma.destinationCategory.create({
    data: {
      name: "Proche nature",
      slug: "proche-nature",
      icon: "tree-pine",
      order: 2,
      links: {
        create: [
          { title: "Chengdu", subtitle: "成都 · Villas avec jardin", order: 0 },
          { title: "Kunming", subtitle: "昆明 · Maisons", order: 1 },
          { title: "Hangzhou", subtitle: "杭州 · Lac de l'Ouest", order: 2 },
          { title: "Guilin", subtitle: "桂林 · Logements nature", order: 3 },
        ],
      },
    },
  });

  await prisma.destinationCategory.create({
    data: {
      name: "Centre-ville",
      slug: "centre-ville",
      icon: "globe",
      order: 3,
      links: {
        create: [
          { title: "Jing'an, Shanghai", subtitle: "静安区 · Studios meublés", order: 0 },
          { title: "Dongcheng, Beijing", subtitle: "东城区 · Appartements", order: 1 },
          { title: "Yuexiu, Guangzhou", subtitle: "越秀区 · Chambres privées", order: 2 },
          { title: "Futian, Shenzhen", subtitle: "福田区 · Logements", order: 3 },
          { title: "Jinjiang, Chengdu", subtitle: "锦江区 · Studios", order: 4 },
        ],
      },
    },
  });

  // ─── Curated Property Lists ───
  const listBeijing = await prisma.propertyList.create({
    data: {
      title: "Logements populaires · Beijing",
      slug: "populaires-beijing",
      tag: "beijing",
      order: 0,
      isActive: true,
    },
  });

  const listShanghai = await prisma.propertyList.create({
    data: {
      title: "Coups de cœur · Shanghai",
      slug: "coups-de-coeur-shanghai",
      tag: "shanghai",
      order: 1,
      isActive: true,
    },
  });

  const listLuxe = await prisma.propertyList.create({
    data: {
      title: "Logements de luxe",
      slug: "logements-luxe",
      order: 2,
      isActive: true,
    },
  });

  // Assign properties to lists
  const beijingProps = properties.filter((p) => p.cityId === cities[0].id);
  for (let i = 0; i < beijingProps.length; i++) {
    await prisma.propertyListItem.create({
      data: { listId: listBeijing.id, propertyId: beijingProps[i].id, order: i },
    });
  }

  const shanghaiProps = properties.filter((p) => p.cityId === cities[1].id);
  for (let i = 0; i < shanghaiProps.length; i++) {
    await prisma.propertyListItem.create({
      data: { listId: listShanghai.id, propertyId: shanghaiProps[i].id, order: i },
    });
  }

  const luxeProps = properties.filter((p) => Number(p.monthlyRent) >= 10000);
  for (let i = 0; i < luxeProps.length; i++) {
    await prisma.propertyListItem.create({
      data: { listId: listLuxe.id, propertyId: luxeProps[i].id, order: i },
    });
  }

  console.log("Seed completed successfully!");
  console.log(`Created: 1 admin, 2 agents, 1 viewer, 5 cities, 3 agencies, ${properties.length} properties, 3 curated lists, 4 destination categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
