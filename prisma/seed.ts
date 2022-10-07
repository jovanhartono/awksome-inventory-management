import { PrismaClient } from '@prisma/client';
import { variants, products } from '../lib/seed';
import {nanoid} from "nanoid";

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

    console.log(`Start seeding ...`)
    for (const data of variants) {
        const variant = await prisma.variant.create({
            data: {
                id: `VR-${nanoid(5)}`,
                name: data.name
            }
        })
        console.log(`Created variant with name: ${variant.name}`)
    }

    for (const data of products) {
        const product = await prisma.product.create({
            data: {
                id: `PR-${nanoid(5)}`,
                name: data.name
            }
        })

        console.log(`Created product with name: ${product.name}`);
    }

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
