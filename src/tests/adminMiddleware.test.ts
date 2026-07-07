import { adminOnly } from "../middlewares/adminMiddleware";
import { User } from "../models/User";

jest.mock("../models/User");

describe("adminOnly middleware", () => {
  it("should allow admin users", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      role: "ADMIN",
    });

    const req: any = {
      user: {
        id: 1,
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should block non-admin users", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue({
      id: 2,
      role: "USER",
    });

    const req: any = {
      user: {
        id: 2,
      },
    };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Admin only.",
    });

    expect(next).not.toHaveBeenCalled();
  });
});