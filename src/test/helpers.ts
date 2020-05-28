import Mock = jest.Mock;

export const verifyErrResponse = (statusCodeMock: Mock, sendMock: Mock, statusCode: number, message: string) => {
    expect(statusCodeMock).toBeCalledWith(statusCode);
    expect(sendMock).toBeCalledWith(message);
};