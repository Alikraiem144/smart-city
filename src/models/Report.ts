import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export class Report extends Model {
  public id!: number;
  public userId!: number;
  public reportDate!: Date;
  public latitude!: number;
  public longitude!: number;
  public defectType!: "BUCA" | "AVVALLAMENTO";
  public severity!: "LOW" | "MEDIUM" | "HIGH";
  public status!: "PENDING" | "VALIDATED" | "REJECTED";
}

Report.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },

    reportDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    latitude: { type: DataTypes.FLOAT, allowNull: false },

    longitude: { type: DataTypes.FLOAT, allowNull: false },

    defectType: {
      type: DataTypes.ENUM("BUCA", "AVVALLAMENTO"),
      allowNull: false,
    },

    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "VALIDATED", "REJECTED"),
      defaultValue: "PENDING",
    },
  },
  {
    sequelize,
    tableName: "reports",
  }
);

User.hasMany(Report, { foreignKey: "userId" });
Report.belongsTo(User, { foreignKey: "userId" });