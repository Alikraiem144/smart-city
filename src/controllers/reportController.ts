import { Request, Response, NextFunction } from "express";import { Op } from "sequelize";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { getDistance } from "geolib";
import { featureCollection, point } from "@turf/helpers";
import clustersDbscan from "@turf/clusters-dbscan";
import { Report } from "../models/Report";
import { User } from "../models/User";
export const createReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const { reportDate, latitude, longitude, defectType, severity } = req.body;

    const report = await Report.create({
      userId,
      reportDate,
      latitude,
      longitude,
      defectType,
      severity,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reports = await Report.findAll();

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};
export const getMyReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { status, startDate, endDate } = req.query;

    const whereCondition: any = { userId };

    if (status) whereCondition.status = status;

    if (startDate && endDate) {
      whereCondition.reportDate = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    const reports = await Report.findAll({
      where: whereCondition,
    });

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

const getStatisticsData = async () => {
  const statistics = await Report.findAll({
    attributes: [
      "defectType",
      "severity",
      "status",
      [Report.sequelize!.fn("COUNT", Report.sequelize!.col("id")), "count"],
    ],
    group: ["defectType", "severity", "status"],
    order: [
      ["defectType", "ASC"],
      ["severity", "ASC"],
      ["status", "ASC"],
    ],
    raw: true,
  });

  return statistics;
};

export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {   try {
    const statistics = await getStatisticsData();

    res.status(200).json({
      message: "Statistics retrieved successfully",
      statistics,
    });
  } catch (error) {
  next(error);
}
};
export const exportStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const format = String(req.query.format || "json").toLowerCase();

    const statistics = await getStatisticsData();

    if (format === "json") {
      return res.status(200).json({
        message: "Statistics exported as JSON",
        statistics,
      });
    }

    if (format === "csv") {
      const parser = new Parser({
        fields: ["defectType", "severity", "status", "count"],
      });

      const csv = parser.parse(statistics);

      res.header("Content-Type", "text/csv");
      res.attachment("statistics.csv");

      return res.send(csv);
    }

    if (format === "pdf") {
      res.header("Content-Type", "application/pdf");
      res.attachment("statistics.pdf");

      const doc = new PDFDocument();

      doc.pipe(res);

      doc.fontSize(18).text("Report Statistics", {
        align: "center",
      });

      doc.moveDown();

      statistics.forEach((item: any, index: number) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. Defect: ${item.defectType} | Severity: ${
              item.severity
            } | Status: ${item.status} | Count: ${item.count}`
          );
      });

      doc.end();
      return;
    }

    return res.status(400).json({
      message: "Invalid format. Use json, csv or pdf",
    });
  } catch (error) {
    next(error);
  }
};
export const clusterReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { defectType, severity, radius, format } = req.query;

    if (!defectType || !severity || !radius) {
      return res.status(400).json({
        message: "defectType, severity and radius are required",
      });
    }

    const reports = await Report.findAll({
      where: {
        status: "VALIDATED",
        defectType,
        severity,
      },
      raw: true,
    });

    const points = reports.map((report: any) =>
      point([Number(report.longitude), Number(report.latitude)], report)
    );

    const collection = featureCollection(points);

    const clustered = clustersDbscan(collection, Number(radius), {
      units: "meters",
    });

    const result = clustered.features.map((feature: any) => ({
      ...feature.properties,
      cluster: feature.properties.cluster,
      dbscan: feature.properties.dbscan,
    }));

    const exportFormat = String(format || "json").toLowerCase();

    if (exportFormat === "json") {
      return res.status(200).json({
        message: "Clusters retrieved successfully",
        clusters: result,
      });
    }

    if (exportFormat === "csv") {
      const parser = new Parser();
      const csv = parser.parse(result);

      res.header("Content-Type", "text/csv");
      res.attachment("clusters.csv");

      return res.send(csv);
    }

    if (exportFormat === "pdf") {
      res.header("Content-Type", "application/pdf");
      res.attachment("clusters.pdf");

      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(18).text("DBSCAN Clustering Results", {
        align: "center",
      });

      doc.moveDown();

      result.forEach((item: any, index: number) => {
        doc
          .fontSize(12)
          .text(
            `${index + 1}. Report ID: ${item.id} | Defect: ${
              item.defectType
            } | Severity: ${item.severity} | Cluster: ${
              item.cluster ?? "noise"
            }`
          );
      });

      doc.end();
      return;
    }

    return res.status(400).json({
      message: "Invalid format. Use json, csv or pdf",
    });
  } catch (error) {
    next(error);
  }
};
export const updateReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(Number(id));

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const user = (req as any).user;

    if (user.role !== "ADMIN" && report.userId !== user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this report",
      });
    }

    await report.update(req.body);

    res.status(200).json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    next(error);
  }
};
export const updateReportStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByPk(Number(id));

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (!["VALIDATED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be VALIDATED or REJECTED",
      });
    }

    const oldStatus = report.status;

    await report.update({ status });

    let reward = 0;

    if (oldStatus !== "VALIDATED" && status === "VALIDATED") {
      const user = await User.findByPk(report.userId);

      if (user) {
        const validatedReportsCount = await Report.count({
          where: {
            userId: report.userId,
            status: "VALIDATED",
          },
        });

        reward = validatedReportsCount > 10 ? 0.15 : 0.1;

        await user.update({
          coins: Number(user.coins) + reward,
        });
      }
    }

    res.status(200).json({
      message: "Report status updated successfully",
      reward,
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateReportStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "ids must be a non-empty array",
      });
    }

    if (!["VALIDATED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be VALIDATED or REJECTED",
      });
    }

    const reports = await Report.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    if (reports.length === 0) {
      return res.status(404).json({
        message: "No reports found",
      });
    }

    let totalReward = 0;

    for (const report of reports) {
      const oldStatus = report.status;

      await report.update({ status });

      if (oldStatus !== "VALIDATED" && status === "VALIDATED") {
        const user = await User.findByPk(report.userId);

        if (user) {
          const validatedReportsCount = await Report.count({
            where: {
              userId: report.userId,
              status: "VALIDATED",
            },
          });

          const reward = validatedReportsCount > 10 ? 0.15 : 0.1;
          totalReward += reward;

          await user.update({
            coins: Number(user.coins) + reward,
          });
        }
      }
    }

    res.status(200).json({
      message: `${reports.length} reports updated successfully`,
      totalReward,
      reports,
    });
  } catch (error) {
    next(error);
  }
};export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(Number(id));

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const user = (req as any).user;

    if (user.role !== "ADMIN" && report.userId !== user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this report",
      });
    }

    await report.destroy();

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const nearbyReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      latitude,
      longitude,
      radius,
      defectType,
      severity,
      startDate,
      endDate,
      format,
    } = req.query;

    if (!latitude || !longitude || !radius || !defectType || !severity) {
      return res.status(400).json({
        message:
          "latitude, longitude, radius, defectType and severity are required",
      });
    }

    const whereCondition: any = {
      status: "VALIDATED",
      defectType,
      severity,
    };

    if (startDate && endDate) {
      whereCondition.reportDate = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    const reports = await Report.findAll({
      where: whereCondition,
      raw: true,
    });

    const nearby = reports
      .map((report: any) => {
        const distance = getDistance(
          {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
          {
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
          }
        );

        return {
          ...report,
          distance,
        };
      })
      .filter((report: any) => report.distance <= Number(radius));

    const exportFormat = String(format || "json").toLowerCase();

    if (exportFormat === "json") {
      return res.status(200).json({
        message: "Nearby reports retrieved successfully",
        reports: nearby,
      });
    }

    if (exportFormat === "csv") {
      const parser = new Parser();
      const csv = parser.parse(nearby);

      res.header("Content-Type", "text/csv");
      res.attachment("nearby-reports.csv");

      return res.send(csv);
    }

    return res.status(400).json({
      message: "Invalid format. Use json or csv",
    });
  } catch (error) {
    next(error);
  }
};