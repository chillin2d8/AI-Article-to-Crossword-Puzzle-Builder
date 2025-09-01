
import React from 'react';

interface LegalModalProps {
    onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800">Terms of Service</h2>
                    <div className="mt-4 text-sm text-slate-600 max-h-64 overflow-y-auto space-y-3 pr-2">
                        <p>
                            <strong>No Liability:</strong> This service is provided "as is" without any warranties. The creators and providers of this tool are not liable for any damages or losses related to your use of this application. You assume full responsibility for any content you generate and its use.
                        </p>
                        <p>
                            <strong>Copyrighted Materials:</strong> You agree not to use this service to process any text or images for which you do not have the legal rights. It is your sole responsibility to ensure that you have permission from the copyright holder to use any material you input into this tool. The creators of this application are not responsible for any copyright infringement that may occur as a result of your use of the service.
                        </p>
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end items-center rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
