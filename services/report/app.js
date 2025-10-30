const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
      }
}

async function consume() {
    //TODO: Constuir a comunicação com a fila 
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, async (msg) => {
        try {
            const data = JSON.parse(msg.content)
            // deliveryData (from shipping) should contain products array
            if (data.products && Array.isArray(data.products)) {
                await updateReport(data.products)
                await printReport()
            } else if (data.products) {
                // if products is present but not array, try to coerce
                await updateReport([data.products])
                await printReport()
            } else {
                console.log('X REPORT - message has no products field')
            }
        } catch (err) {
            console.log(`X ERROR TO PROCESS: ${err}`)
        }
    })
} 

consume()
