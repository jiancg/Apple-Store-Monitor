const request = require("request-promise").defaults({
  resolveWithFullResponse: true,
});
const Discord = require("discord.js");
colors = require("colors");

const config = require("./config.json");
const config_read = JSON.parse(JSON.stringify(config));

var config_parsed = {
  zip_code: config_read.zip_code,
  radius: config_read.radius,
  sku: config_read.sku,
  webhook: config_read.webhook,
  test_webhook: config_read.test_webhook,
  send_webhooks: config_read.send_webhooks,
  delay: config_read.delay,
};

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

const webhook = new Discord.WebhookClient(
  config_parsed.webhook.split("/")[5],
  config_parsed.webhook.split("/")[6]
);

let online_stores_url;
let status = [];

function sendTestWebhook() {
  let embed = new Discord.MessageEmbed();
  embed.title = "Test Webhook 🟢";

  embed.setFooter(
    "https://github.com/jiancg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg/1200px-Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg"
  );
  embed.setColor("#11ecba");
  embed.setDescription("Your webhook is working!");
  embed.setTimestamp();
  webhook.send({
    username: "Apple Scraper",
    avatarURL:
      "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3d547-94ff-48e1-9f20-8c14a7030a02_2000x2000.jpeg",
    embeds: [embed],
  });
}

async function monitor() {
  try {
    let response = await request(
      `https://www.apple.com/ca/shop/fulfillment-messages?pl=true&parts.0=${
        config_parsed.sku
      }&location=${config_parsed.zip_code.split(" ")[0]} ${
        config_parsed.zip_code.split(" ")[1]
      }`,
      {
        headers: {
          authority: "www.apple.com",
          "sec-ch-ua":
            '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
          "sec-ch-ua-platform": '"Windows"',
          accept: "*/*",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          "accept-language": "en-US,en;q=0.9",
        },
      }
    );
    response.body = JSON.parse(response.body);

    if (
      response.body.body.content.pickupMessage.stores[0].storedistance <
      config_parsed.radius
    ) {
      for (let stores of response.body.body.content.pickupMessage.stores) {
        if (status[stores.storeName] == undefined) {
          status[stores.storeName] = null;
        }

        if (
          stores.partsAvailability[
            config_parsed.sku
          ].messageTypes.regular.storePickupProductTitle
            .toLowerCase()
            .includes("pro")
        ) {
          online_stores_url =
            "https://www.apple.com/ca/shop/buy-iphone/iphone-13-pro";
        } else if (
          stores.partsAvailability[
            config_parsed.sku
          ].messageTypes.regular.torePickupProductTitle
            .toLowerCase()
            .includes("mini")
        ) {
          online_stores_url =
            "https://www.apple.com/ca/shop/buy-iphone/iphone-13-mini";
        } else {
          online_stores_url =
            "https://www.apple.com/ca/shop/buy-iphone/iphone-13";
        }

        if (config_parsed.radius >= stores.storedistance) {
          if (
            stores.partsAvailability[config_parsed.sku].pickupDisplay !=
              "available" &&
            status[stores.storeName] != "oos" &&
            config_parsed.send_webhooks
          ) {
            status[stores.storeName] = "oos";

            console.log(
              "[" +
                new Date()
                  .toLocaleString("en-US")
                  .replace("/", "-")
                  .replace("/", "-")
                  .replace(",", "") +
                "] " +
                stores.partsAvailability[config_parsed.sku]
                  .storePickupProductTitle +
                " " +
                "Out Of Stock At".red +
                " Apple " +
                stores.storeName
            );

            let embed = new Discord.MessageEmbed();
            embed.title = "Product Out of Stock 🔴";
            embed.setFooter(
              "https://github.com/jiancg",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg/1200px-Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg"
            );
            embed.setColor("#ec114f");
            embed.addFields(
              {
                name: "Model",
                value:
                  stores.partsAvailability[config_parsed.sku]
                    .storePickupProductTitle,
                inline: true,
              },
              {
                name: "Store",
                value: `Apple ${stores.storeName}`,
                inline: true,
              },
              {
                name: "Status",
                value:
                  stores.partsAvailability[config_parsed.sku].messageTypes
                    .regular.storesPickupQuote,
                inline: true,
              },
              {
                name: "Store Info",
                value: `[Click Here](${stores.reservationUrl})`,
                inline: true,
              },
              {
                name: "Online Store Link",
                value: `[Click Here](${online_stores_url})`,
                inline: true,
              },
              {
                name: "Store Distance",
                value: stores.storedistance + " KM",
                inline: true,
              }
            );
            embed.setTimestamp();
            webhook.send({
              username: "Apple Scraper",
              avatarURL:
                "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3d547-94ff-48e1-9f20-8c14a7030a02_2000x2000.jpeg",
              embeds: [embed],
            });
          } else if (
            stores.partsAvailability[config_parsed.sku].pickupDisplay !=
            "available"
          ) {
            status[stores.storeName] = "oos";
            console.log(
              "[" +
                new Date()
                  .toLocaleString("en-US")
                  .replace("/", "-")
                  .replace("/", "-")
                  .replace(",", "") +
                "] " +
                stores.partsAvailability[config_parsed.sku]
                  .storePickupProductTitle +
                " " +
                "Out Of Stock At".red +
                " Apple " +
                stores.storeName
            );
          } else if (
            stores.partsAvailability[config_parsed.sku].pickupDisplay ==
              "available" &&
            status[stores.storeName] != "instock" &&
            stores.partsAvailability[config_parsed.sku].pickupDisplay !==
              "ineligible" &&
            config_parsed.send_webhooks
          ) {
            status[stores.storeName] = "instock";

            console.log(
              "[" +
                new Date()
                  .toLocaleString("en-US")
                  .replace("/", "-")
                  .replace("/", "-")
                  .replace(",", "") +
                "] " +
                stores.partsAvailability[config_parsed.sku].messageTypes.regular
                  .storePickupProductTitle +
                " " +
                "In Stock".green +
                " At Apple " +
                stores.storeName
            );

            let embed = new Discord.MessageEmbed();
            embed.title = "Product In Stock 🟢";
            embed.setFooter(
              "https://github.com/jiancg",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg/1200px-Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg"
            );
            embed.set;
            embed.setColor("#11ecba");
            embed.addFields(
              {
                name: "Model",
                value:
                  stores.partsAvailability[config_parsed.sku].messageTypes
                    .regular.storePickupQuote,
                inline: true,
              },
              {
                name: "Store",
                value: `Apple ${stores.storeName}`,
                inline: true,
              },
              {
                name: "Status",
                value:
                  stores.partsAvailability[config_parsed.sku].messageTypes
                    .regular.storePickupQuote,
                inline: true,
              },
              {
                name: "Store Info",
                value: `[Click Here](${stores.reservationUrl})`,
                inline: true,
              },
              {
                name: "Online Store Link",
                value: `[Click Here](${online_stores_url})`,
                inline: true,
              },
              {
                name: "Store Distance",
                value: stores.storedistance + " KM",
                inline: true,
              }
            );
            embed.setTimestamp();
            webhook.send({
              username: "Apple Scraper",
              avatarURL:
                "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3d547-94ff-48e1-9f20-8c14a7030a02_2000x2000.jpeg",
              embeds: [embed],
            });
          } else if (
            stores.partsAvailability[config_parsed.sku].pickupDisplay !==
              "unavailable" &&
            stores.partsAvailability[config_parsed.sku].pickupDisplay !==
              "ineligible"
          ) {
            console.log(
              "[" +
                new Date()
                  .toLocaleString("en-US")
                  .replace("/", "-")
                  .replace("/", "-")
                  .replace(",", "") +
                "] " +
                stores.partsAvailability[config_parsed.sku].messageTypes.regular
                  .storePickupProductTitle +
                " " +
                "In Stock".green +
                " At Apple " +
                stores.storeName
            );
          }
        }
      }
    } else {
      let embed = new Discord.MessageEmbed();
      embed.title = "No Stores Found 🔴";
      embed.description =
        "No stores found within " +
        config_parsed.radius +
        " KM of " +
        config_parsed.zip_code;
      embed.setFooter(
        "https://github.com/jiancg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg/1200px-Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg"
      );
      embed.setColor("#11ecba");
      embed.setTimestamp(Date.now());
      await webhook.send({
        username: "Apple Scraper",
        avatarURL:
          "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ed3d547-94ff-48e1-9f20-8c14a7030a02_2000x2000.jpeg",
        embeds: [embed],
      });
      process.exit(0);
    }
    await sleep(config_parsed.delay);
    monitor();
  } catch (e) {
    console.log("Retrying...");
    await sleep(config_parsed.delay);
    monitor();
  }
}

function main() {
  if (config_parsed.test_webhook) {
    sendTestWebhook();
    monitor();
  } else {
    monitor();
  }
}

main();
