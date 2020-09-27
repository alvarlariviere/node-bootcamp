/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // Get stripe object
    const stripe = Stripe(
      'pk_test_51HVkTLKRQgUHFLUBCtg2iVjEie4SaUoHT33myazqNw0nVHdhzWMmJDACT7a3KCOTMmyvzcvlfV18CPROilfyWO6b00pDh5cjuT'
    );

    // Get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    // Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err);
  }
};
