// File: src/scheduler.js
import { PLATFORM } from '../env.js';
import { kv } from '../storage.js';

// Define the scheduling feature interface
interface Schedule {
  id: string;
  url: string;
  scheduleDate: Date;
  customerId: string;
}

// Define the scheduling feature class
class Scheduler {
  async scheduleScan(url, scheduleDate, customerId) {
    try {
      // Generate a unique id for the scheduled scan
      const id = crypto.randomUUID();

      // Create a new schedule object
      const schedule: Schedule = {
        id,
        url,
        scheduleDate,
        customerId,
      };

      // Store the schedule in KV storage
      await kv.put(`schedule:${id}`, JSON.stringify(schedule));

      // Return the scheduled scan id
      return id;
    } catch (error) {
      // Handle errors explicitly
      console.error('Error scheduling scan:', error);
      throw error;
    }
  }

  async getSchedule(id) {
    try {
      // Retrieve the schedule from KV storage
      const schedule = await kv.get(`schedule:${id}`);

      // Return the schedule as a JSON object
      return schedule ? JSON.parse(schedule) : null;
    } catch (error) {
      // Handle errors explicitly
      console.error('Error retrieving schedule:', error);
      throw error;
    }
  }

  async listSchedules(customerId) {
    try {
      // Retrieve all schedules for the customer from KV storage
      const schedules = await kv.list(`schedule:*`);

      // Filter schedules by customer id
      const customerSchedules = schedules.filter((schedule) => {
        const scheduleData = JSON.parse(schedule.value);
        return scheduleData.customerId === customerId;
      });

      // Return the list of schedules
      return customerSchedules.map((schedule) => JSON.parse(schedule.value));
    } catch (error) {
      // Handle errors explicitly
      console.error('Error listing schedules:', error);
      throw error;
    }
  }
}

export default Scheduler;