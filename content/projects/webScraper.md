+++
title = "Ski ticket scraper"
date = 2025-07-18T00:00:00+00:00
technologies = ["Python", "Selenium", "TelegramAPI","Requests/BeautifulSoup"]
status = "Finished"
featured = true
featured_order = 4
+++

Every year in **Verbier**, there’s a limited-time sale offering ski tickets for just **5 CHF**.  
To avoid missing out, I built a **Python bot** that automatically checks the website for new ticket availability and sends alerts when tickets appear.  

The first version used **Selenium** and **Requests/BeautifulSoup** for scraping, connected to **Google services** to send **email notifications**.  

In the **second iteration**, I replaced the email system with a **Telegram bot**, which turned out to be much more convenient and responsive for **real-time alerts**.


