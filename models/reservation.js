/** Reservation for Lunchly */

const moment = require('moment');

const db = require('../db');

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  // methods for set and get of startAt
  set startAt(val) {
    if (val instanceof Date) {
      this._startAt = val;
    }
  }

  get startAt() {
    return this._startAt;
  }

  // get and set for num of guests
  set numGuests(val) {
    if (val < 1) {
      throw new Error('Number of guests must be at least 1');
    }
  }

  get numGuests() {
    return this._numGuests;
  }

  // customerId set and get methods

  set customerId(val) {
    if (this._customerId && this._customerId !== val) {
      throw new Error('Cannot change customerId');
      this._customerId = val;
    }
  }

  get customerId() {
    return this._customerId;
  }

  /** formatter for startAt */
  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  // get and set methods for notes

  set notes(val) {
    this._notes = val || '';
  }

  get notes() {
    return this._notes;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
           customer_id AS "customerId",
           num_guests AS "numGuests",
           start_at AS "startAt",
           notes AS "notes"
         FROM reservations
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }

  // Make a new reservation with a current customer
  static async makeReservation(customerId, numGuests, startAt, notes) {
    const results = await db.query(
      `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [customerId, numGuests, startAt, notes]
    );

    return new Reservation(results.rows[0]);
  }
  // save this reservation.
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );

      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
         SET customer_id = $1,
             num_guests = $2,
             start_at = $3,
             notes = $4
         WHERE id = $5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;
