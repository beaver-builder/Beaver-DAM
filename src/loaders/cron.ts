import env from '@/config';
import { Logger } from '@/helpers/Logger';
import betaboxCotationService from '@/services/betabox_cotation.service';
import moment from 'moment-timezone';
import { schedule } from 'node-cron';

const logger = Logger.getInstance();

export default async () => {
    // Send Alerts Cron
    schedule("* * * * *", async () => {
        if(env.IS_ACTIVE_SAVE_PROCESSED_RESERVATIONS_CRON) {
            console.log('Send IS_ACTIVE_SAVE_PROCESSED_RESERVATIONS_CRON cron');
            try {
                const today = moment();
                const formatString = 'YYYY-MM-DD';
                const daysToFetch = [today.format(formatString)];
                daysToFetch.push(today.subtract(1, 'd').format(formatString));
                daysToFetch.push(today.subtract(2, 'd').format(formatString));
    
                await betaboxCotationService.saveReservationsByRegDates(daysToFetch);            
            } catch (error: any) {
                const errorMessage = error?.message || error
                logger.error('Send Alert cron', errorMessage);
            }
        }
    })
}