import { validateRequest } from "../middlewares/validationMiddleware";
import { validationResult } from "express-validator";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

describe("validateRequest middleware", () => {
  it("should call next if there are no validation errors", () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
    });

    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 400 if validation fails", () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => [
        {
          msg: "latitude must be a number",
        },
      ],
    });

    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});