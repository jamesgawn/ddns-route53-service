import Mock = jest.Mock;

export const verifyErrResponse = (statusCodeMock: Mock, jsonMock: Mock, statusCode: number, message: string) => {
    expect(statusCodeMock).toBeCalledWith(statusCode);
    expect(jsonMock).toBeCalledWith({
        code: statusCode,
        message
    });
};