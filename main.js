class MemoryBank {
    constructor(bankSize) {
        this.bank = new Array(bankSize).fill(0);
    }

    read(address) {
        return this.bank[address];
    }

    write(address, data) {
        this.bank[address] = data;
    }
}

class RAM {
    constructor(numBanks, bankSize, wordSize) {
        this.banks = Array.from({ length: numBanks }, () => new MemoryBank(bankSize));
        this.bankCount = numBanks;
        this.bankSize = bankSize;
        this.wordSize = wordSize;
        this.pageTable = new Array(1024).fill(-1);
    }

    read(virtualAddress) {
        const pageIndex = virtualAddress >> (Math.log2(this.wordSize) + Math.log2(this.bankSize));
        const offset = virtualAddress & (this.wordSize - 1);
        const physicalAddress = this.pageTable[pageIndex] * this.bankSize + offset;
        const bankIndex = pageIndex % this.bankCount; 
        return this.banks[bankIndex].read(physicalAddress);
    }

    write(virtualAddress, data) {
        const pageIndex = virtualAddress >> (Math.log2(this.wordSize) + Math.log2(this.bankSize));
        const offset = virtualAddress & (this.wordSize - 1);
        const physicalAddress = this.pageTable[pageIndex] * this.bankSize + offset;
        const bankIndex = pageIndex % this.bankCount; 
        this.banks[bankIndex].write(physicalAddress, data);
    }

    mapVirtualToPhysical(virtualPage, physicalBank) {
        this.pageTable[virtualPage] = physicalBank;
    }
}

class MMU {
    constructor(numBanks, bankSize, wordSize) {
        this.banks = Array.from({ length: numBanks }, () => new MemoryBank(bankSize));
        this.pageTable = new Array(bankSize).fill(-1);
        this.wordSize = wordSize;
    }

    read(virtualAddress) {
        const pageIndex = virtualAddress >> (Math.log2(this.wordSize) + Math.log2(this.banks[0].bank.length));
        const offset = virtualAddress & (this.wordSize - 1);
        const physicalAddress = this.pageTable[pageIndex] * this.banks[0].bank.length + offset;
        return this.banks[0].read(physicalAddress);
    }

    write(virtualAddress, data) {
        const pageIndex = virtualAddress >> (Math.log2(this.wordSize) + Math.log2(this.banks[0].bank.length));
        const offset = virtualAddress & (this.wordSize - 1);
        const physicalAddress = this.pageTable[pageIndex] * this.banks[0].bank.length + offset;
        this.banks[0].write(physicalAddress, data);
    }

    mapVirtualToPhysical(virtualPage, physicalBank) {
        this.pageTable[virtualPage] = physicalBank;
    }
}

const ram = new RAM(2, 1024, 16);
const mmu = new MMU(2, 1024, 16);

function writeToRAM() {
    const virtualAddress = parseInt(prompt("Digite o endereço virtual de memória para escrever:"));
    const data = parseInt(prompt("Digite os dados para escrever na memória:"));
    ram.write(virtualAddress, data);
    if (isNaN(virtualAddress) || isNaN(data)) {
        updateOutput("Parâmetro indefinido");
        return;
    }
    updateOutput(`Escrito ${data} no endereço virtual ${virtualAddress} da memória.`);
}

function readFromRAM() {
    const virtualAddress = parseInt(prompt("Digite o endereço virtual de memória para ler:"));
    const data = ram.read(virtualAddress);
        if (isNaN(virtualAddress)) {
        updateOutput("Parâmetro indefinido");
        return;
        }
    updateOutput(`Lido ${data} do endereço virtual ${virtualAddress} da memória.`);
}

function mapPage() {
    const virtualPage = parseInt(prompt("Digite o número da página virtual para mapear:"));
    const physicalBank = parseInt(prompt("Digite o banco de memória físico para mapear a página virtual:"));
    if (isNaN(virtualPage) || isNaN(physicalBank)) {
        updateOutput("Parâmetro indefinido");
        return;
    }
    mmu.mapVirtualToPhysical(virtualPage, physicalBank);
    updateOutput(`Página virtual ${virtualPage} mapeada para o banco de memória físico ${physicalBank}.`);
    updateOutput(`Tabela de Páginas: ${mmu.pageTable}`);

    const message = `Página virtual ${virtualPage} mapeada para o banco de memória físico ${physicalBank}.`;
    const pageTableMessage = `Tabela de Páginas: ${mmu.pageTable.join(', ')}`;
    updateOutput(`${message}<br>${pageTableMessage}`);
}

function updateOutput(message) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = message;
}