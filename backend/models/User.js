import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  internshipConfig: {
    targetHours: {
      type: Number,
      default: 500,
      min: [1, 'Target hours must be at least 1']
    },
    startDate: {
      type: Date
    },
    excludeWeekends: {
      saturday: {
        type: Boolean,
        default: false
      },
      sunday: {
        type: Boolean,
        default: false
      }
    },
    excludedWeekdays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    holidays: [{
      type: Date
    }],
    lunchBreak: {
      enabled: {
        type: Boolean,
        default: false
      },
      hours: {
        type: Number,
        default: 1,
        min: 0,
        max: 8
      }
    },
    defaultStartTime: {
      type: String,
      default: '08:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    defaultEndTime: {
      type: String,
      default: '17:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;

