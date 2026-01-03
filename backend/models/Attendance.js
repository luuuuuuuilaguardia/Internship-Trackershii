import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  hoursLogged: {
    type: Number,
    required: [true, 'Hours logged is required'],
    min: [0, 'Hours cannot be negative'],
    max: [24, 'Hours cannot exceed 24']
  },
  startTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
  },
  endTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function(next) {
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

