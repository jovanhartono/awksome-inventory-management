import { PrismaClient } from '@prisma/client';
import { variants, products } from '../lib/seed';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing Database ...');

    await prisma.orderDetails.deleteMany();
    console.log('Succesfully deleted order details');

    await prisma.order.deleteMany();
    console.log('Succesfully deleted order');

    await prisma.productDetail.deleteMany();
    console.log('Succesfully deleted product details');

    await prisma.product.deleteMany();
    console.log('Succesfully deleted product');

    await prisma.variant.deleteMany();
    console.log('Succesfully deleted variant');

    await prisma.$queryRaw`ALTER TABLE OrderDetails AUTO_INCREMENT = 1`
    console.log('reset order detail auto increment to 1')

    await prisma.$queryRaw`ALTER TABLE ProductDetail AUTO_INCREMENT = 1`
    console.log('reset product detail auto increment to 1')

    await prisma.$queryRaw`ALTER TABLE Product AUTO_INCREMENT = 1`
    console.log('reset product auto increment to 1')

    await prisma.$queryRaw`ALTER TABLE Variant AUTO_INCREMENT = 1`
    console.log('reset variant auto increment to 1')

    console.log(`Start seeding ...`)
    for (const data of variants) {
        const variant = await prisma.variant.create({
            data
        })
        console.log(`Created variant with name: ${variant.name}`)
    }

    await prisma.product.createMany({
        data: products
    })
    console.log('Finished adding products')

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
